import { prisma } from "@/lib/prisma";
import type { Prisma, MovementType } from "@prisma/client";

type TxClient = Prisma.TransactionClient;

export class AuditService {
  static async log(
    userId: string,
    module: string,
    action: string,
    entityId?: string | null,
    oldValue?: unknown,
    newValue?: unknown,
    tx?: TxClient
  ) {
    const db = tx || prisma;
    await db.auditLog.create({
      data: {
        userId,
        module,
        action,
        entityId: entityId || undefined,
        oldValue: oldValue ? JSON.parse(JSON.stringify(oldValue)) : undefined,
        newValue: newValue ? JSON.parse(JSON.stringify(newValue)) : undefined,
      },
    });
  }
}

export class InventoryService {
  /**
   * Get the free (available) quantity for a product
   */
  static getFreeQty(onHandQty: number, reservedQty: number): number {
    return onHandQty - reservedQty;
  }

  /**
   * Reserve stock for a confirmed order
   * Does NOT reduce onHandQty — only increases reservedQty
   */
  static async reserveStock(
    productId: string,
    quantity: number,
    userId: string,
    tx?: TxClient
  ) {
    const db = tx || prisma;
    const product = await db.product.findUniqueOrThrow({
      where: { id: productId },
    });

    const freeQty = this.getFreeQty(product.onHandQty, product.reservedQty);
    if (freeQty < quantity) {
      throw new Error(
        `Insufficient free stock for ${product.name}. Available: ${freeQty}, Requested: ${quantity}`
      );
    }

    await db.product.update({
      where: { id: productId },
      data: { reservedQty: { increment: quantity } },
    });

    await AuditService.log(
      userId,
      "INVENTORY",
      "STOCK_RESERVED",
      productId,
      { reservedQty: product.reservedQty },
      { reservedQty: product.reservedQty + quantity },
      tx
    );
  }

  /**
   * Release a reservation (cancellation or delivery)
   */
  static async releaseReservation(
    productId: string,
    quantity: number,
    userId: string,
    tx?: TxClient
  ) {
    const db = tx || prisma;
    const product = await db.product.findUniqueOrThrow({
      where: { id: productId },
    });

    const releaseQty = Math.min(quantity, product.reservedQty);

    await db.product.update({
      where: { id: productId },
      data: { reservedQty: { decrement: releaseQty } },
    });

    await AuditService.log(
      userId,
      "INVENTORY",
      "STOCK_RELEASED",
      productId,
      { reservedQty: product.reservedQty },
      { reservedQty: product.reservedQty - releaseQty },
      tx
    );
  }

  /**
   * Increase stock (purchase receipt, manufacturing production)
   */
  static async increaseStock(
    productId: string,
    quantity: number,
    movementType: MovementType,
    referenceType: string,
    referenceId: string,
    userId: string,
    tx?: TxClient
  ) {
    const db = tx || prisma;
    const product = await db.product.findUniqueOrThrow({
      where: { id: productId },
    });

    const previousStock = product.onHandQty;
    const newStock = previousStock + quantity;

    await db.product.update({
      where: { id: productId },
      data: { onHandQty: newStock },
    });

    // Create stock ledger entry
    await db.stockLedger.create({
      data: {
        productId,
        movementType,
        quantity,
        previousStock,
        newStock,
        referenceType,
        referenceId,
        createdBy: userId,
      },
    });

    await AuditService.log(
      userId,
      "INVENTORY",
      "STOCK_INCREASED",
      productId,
      { onHandQty: previousStock },
      { onHandQty: newStock, movementType, quantity },
      tx
    );
  }

  /**
   * Decrease stock (sales delivery, manufacturing consumption)
   */
  static async decreaseStock(
    productId: string,
    quantity: number,
    movementType: MovementType,
    referenceType: string,
    referenceId: string,
    userId: string,
    tx?: TxClient
  ) {
    const db = tx || prisma;
    const product = await db.product.findUniqueOrThrow({
      where: { id: productId },
    });

    if (product.onHandQty < quantity) {
      throw new Error(
        `Insufficient stock for ${product.name}. On hand: ${product.onHandQty}, Required: ${quantity}`
      );
    }

    const previousStock = product.onHandQty;
    const newStock = previousStock - quantity;

    await db.product.update({
      where: { id: productId },
      data: { onHandQty: newStock },
    });

    // Create stock ledger entry
    await db.stockLedger.create({
      data: {
        productId,
        movementType,
        quantity: -quantity,
        previousStock,
        newStock,
        referenceType,
        referenceId,
        createdBy: userId,
      },
    });

    await AuditService.log(
      userId,
      "INVENTORY",
      "STOCK_DECREASED",
      productId,
      { onHandQty: previousStock },
      { onHandQty: newStock, movementType, quantity },
      tx
    );
  }

  /**
   * Deliver stock: decrease onHand + release reservation
   */
  static async deliverStock(
    productId: string,
    quantity: number,
    referenceType: string,
    referenceId: string,
    userId: string,
    tx?: TxClient
  ) {
    await this.decreaseStock(
      productId,
      quantity,
      "SALES_DELIVERY",
      referenceType,
      referenceId,
      userId,
      tx
    );
    await this.releaseReservation(productId, quantity, userId, tx);
  }

  /**
   * Manual stock adjustment
   */
  static async adjustStock(
    productId: string,
    newQuantity: number,
    reason: string,
    userId: string,
    tx?: TxClient
  ) {
    const db = tx || prisma;
    const product = await db.product.findUniqueOrThrow({
      where: { id: productId },
    });

    const previousStock = product.onHandQty;
    const difference = newQuantity - previousStock;

    await db.product.update({
      where: { id: productId },
      data: { onHandQty: newQuantity },
    });

    await db.stockLedger.create({
      data: {
        productId,
        movementType: "MANUAL_ADJUSTMENT",
        quantity: difference,
        previousStock,
        newStock: newQuantity,
        referenceType: "Manual",
        referenceId: reason,
        createdBy: userId,
      },
    });

    await AuditService.log(
      userId,
      "INVENTORY",
      "STOCK_ADJUSTED",
      productId,
      { onHandQty: previousStock },
      { onHandQty: newQuantity, reason },
      tx
    );
  }
}
