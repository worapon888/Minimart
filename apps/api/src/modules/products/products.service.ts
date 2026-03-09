import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { ListProductsQueryDto } from "./dto/list-products.query";
import { CreateProductDto } from "./dto/create-product.dto";

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(q: ListProductsQueryDto) {
    const normalized = this.normalizeQuery(q);
    const where = this.buildWhere(normalized);

    const [total, items] = await this.prisma.$transaction([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: normalized.offset,
        take: normalized.limit,
        include: {
          inventory: {
            select: {
              onHand: true,
              reserved: true,
            },
          },
        },
      }),
    ]);

    const data = items.map((item) => ({
      ...item,
      stock: Math.max((item.inventory?.onHand ?? 0) - (item.inventory?.reserved ?? 0), 0),
    }));

    return {
      ok: true,
      meta: {
        total,
        limit: normalized.limit,
        offset: normalized.offset,
      },
      data,
    };
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        inventory: {
          select: {
            onHand: true,
            reserved: true,
          },
        },
      },
    });

    if (!product) throw new NotFoundException("Product not found");
    return {
      ok: true,
      data: {
        ...product,
        stock: Math.max(
          (product.inventory?.onHand ?? 0) - (product.inventory?.reserved ?? 0),
          0,
        ),
      },
    };
  }

  async create(dto: CreateProductDto) {
    const normalizedSku = dto.sku.trim();

    const exists = await this.prisma.product.findUnique({
      where: { sku: normalizedSku },
      select: { id: true },
    });
    if (exists) {
      throw new BadRequestException("SKU already exists");
    }

    const created = await this.prisma.product.create({
      data: {
        title: dto.title.trim(),
        sku: normalizedSku,
        priceCents: dto.priceCents,
        category: dto.category?.trim() || null,
        description: dto.description?.trim() || null,
        thumbnail: dto.thumbnail?.trim() || null,
        tags: dto.tags?.map((x) => x.trim()).filter(Boolean) ?? [],
      },
    });

    return { ok: true, data: created };
  }

  // -----------------------
  // helpers
  // -----------------------

  private normalizeQuery(q: ListProductsQueryDto) {
    return {
      search: (q.search ?? "").trim(),
      category: (q.category ?? "").trim(),
      limit: q.limit ?? 24,
      offset: q.offset ?? 0,
    };
  }

  private buildWhere(q: { search: string; category: string }) {
    const where: any = {};

    if (q.category) {
      where.category = { equals: q.category, mode: "insensitive" };
    }

    if (q.search) {
      where.OR = [
        { title: { contains: q.search, mode: "insensitive" } },
        { description: { contains: q.search, mode: "insensitive" } },
      ];
    }

    return where;
  }
}
