import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseInterceptors,
} from "@nestjs/common";
import { ProductsService } from "./products.service";
import { ListProductsQueryDto } from "./dto/list-products.query";
import { IdParamDto } from "./dto/id-param.dto";
import { CreateProductDto } from "./dto/create-product.dto";
import { ProductsListCacheInterceptor } from "../../common/interceptors/products-list-cache.interceptor";
@Controller("products")
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // ✅ /products?search=&category=&limit=&offset=
  @Get()
  @UseInterceptors(ProductsListCacheInterceptor)
  findAll(@Query() q: ListProductsQueryDto) {
    return this.productsService.findAll(q);
  }

  // ✅ /products/:id
  @Get(":id")
  findOne(@Param() params: IdParamDto) {
    return this.productsService.findOne(params.id);
  }

  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }
}
