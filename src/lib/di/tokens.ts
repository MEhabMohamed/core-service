export const Tokens = {
    // services
    AuthService: Symbol.for("AuthService"),
    UserService: Symbol.for("UserService"),
    ProductService: Symbol.for("ProductService"),
    BranchService: Symbol.for("BranchService"),
    RestaurantService: Symbol.for("RestaurantService"),
    PermissionCacheService: Symbol.for("PermissionCacheService"),
    MemberService: Symbol.for("MemberService"),
    CustomerAddressesService: Symbol.for("CustomerAddressesService"),

    // controllers
    AuthController: Symbol.for("AuthController"),
    UserController: Symbol.for("UserController"),
    ProductController: Symbol.for("ProductController"),
    BranchController: Symbol.for("BranchController"),
    RestaurantController: Symbol.for("RestaurantController"),
    MemberController: Symbol.for("MemberController"),
    CustomerAddressesController: Symbol.for("CustomerAddressesController"),

    // libs/infra
    Logger: Symbol.for("Logger"),
    CacheProvider: Symbol.for("CacheProvider"),
    EmailProvider: Symbol.for("EmailProvider")
}