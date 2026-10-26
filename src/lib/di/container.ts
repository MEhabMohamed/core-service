import { container } from "tsyringe";
import { Tokens } from "./tokens";
import { Logger } from "../logger/logger";
import { AuthService } from "../../app/auth/service/auth.service";
import { PermissionCacheService } from "../../app/rbac/service/permission-cache.service";
import { UserService } from "../../app/user/service/user.service";
import { ProductService } from "../../app/product/service/product.service";
import { BranchService } from "../../app/branch/service/branch.service";
import { RestaurantService } from "../../app/restaurant/service/restaurant.service";
import { MemberService } from "../../app/rbac/service/member.service";
import { CustomerAddressesService } from "../../app/customer-address/service/customer-address.service";
import { AuthController } from "../../app/auth/controller/auth.controller";
import { UserController } from "../../app/user/controller/user.controller";
import { ProductController } from "../../app/product/controller/product.controller";
import { BranchController } from "../../app/branch/controller/branch.controller";
import { RestaurantController } from "../../app/restaurant/controller/restaurant.controller";
import { MemberController } from "../../app/rbac/controller/member.controller";
import { CustomerAddressesController } from "../../app/customer-address/controller/customer-address.controller";
import { cacheProvider } from "../cache/init";
import { emailProvider } from "../email/init";

container.registerSingleton(Tokens.Logger, Logger);

// services
container.registerSingleton(Tokens.AuthService, AuthService);
container.registerSingleton(Tokens.PermissionCacheService, PermissionCacheService);
container.registerSingleton(Tokens.UserService, UserService);
container.registerSingleton(Tokens.ProductService, ProductService);
container.registerSingleton(Tokens.BranchService, BranchService);
container.registerSingleton(Tokens.RestaurantService, RestaurantService);
container.registerSingleton(Tokens.MemberService, MemberService);
container.registerSingleton(Tokens.CustomerAddressesService, CustomerAddressesService);

// controllers
container.registerSingleton(Tokens.AuthController, AuthController);
container.registerSingleton(Tokens.UserController, UserController);
container.registerSingleton(Tokens.ProductController, ProductController);
container.registerSingleton(Tokens.BranchController, BranchController);
container.registerSingleton(Tokens.RestaurantController, RestaurantController);
container.registerSingleton(Tokens.MemberController, MemberController);
container.registerSingleton(Tokens.CustomerAddressesController, CustomerAddressesController);

// libs
container.registerInstance(Tokens.CacheProvider, cacheProvider);
container.registerInstance(Tokens.EmailProvider, emailProvider);

export { container }