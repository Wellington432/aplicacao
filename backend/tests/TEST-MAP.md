# Mapa de funções para testes

O inventário abaixo foi feito antes da criação da suíte. Os testes de integração chamam a aplicação Express real; somente dependências externas (e-mail) são isoladas. Os testes unitários usam mocks para Prisma e integrações.

## Controllers

| Arquivo de origem | Função/método | Arquivo unitário | Arquivo de integração |
|---|---|---|---|
| `src/controllers/category/CreateCategoryController.ts` | `handle` | `tests/unit/controllers/category/createCategory.unit.test.ts` | `tests/integration/routes/createCategory.integration.test.ts` |
| `src/controllers/category/ListCategoryController.ts` | `handle` | `tests/unit/controllers/category/listCategory.unit.test.ts` | `tests/integration/routes/listCategory.integration.test.ts` |
| `src/controllers/product/CreateProductController.ts` | `handle` | `tests/unit/controllers/product/createProduct.unit.test.ts` | `tests/integration/routes/createProduct.integration.test.ts` |
| `src/controllers/product/DeleteProductController.ts` | `handle` | `tests/unit/controllers/product/deleteProduct.unit.test.ts` | `tests/integration/routes/deleteProduct.integration.test.ts` |
| `src/controllers/product/ListProductController.ts` | `handle` | `tests/unit/controllers/product/listProduct.unit.test.ts` | `tests/integration/routes/listProduct.integration.test.ts` |
| `src/controllers/product/UpdateProductController.ts` | `handle` | `tests/unit/controllers/product/updateProduct.unit.test.ts` | `tests/integration/routes/updateProduct.integration.test.ts` |
| `src/controllers/user/AuthGoogleUserController.ts` | `handle` | `tests/unit/controllers/user/authGoogleUser.unit.test.ts` | `tests/integration/routes/authGoogleUser.integration.test.ts` |
| `src/controllers/user/AuthUserController.ts` | `handle` | `tests/unit/controllers/user/authUser.unit.test.ts` | `tests/integration/routes/authUser.integration.test.ts` |
| `src/controllers/user/CreateUserController.ts` | `handle` | `tests/unit/controllers/user/createUser.unit.test.ts` | `tests/integration/routes/createUser.integration.test.ts` |
| `src/controllers/user/EnderecoController.ts` | `buscarCep` | `tests/unit/controllers/user/buscarCep.unit.test.ts` | `tests/integration/routes/lookupCep.integration.test.ts` |
| `src/controllers/user/EnderecoController.ts` | `buscarDoUsuario` | `tests/unit/controllers/user/buscarEnderecoUsuario.unit.test.ts` | `tests/integration/routes/getUserAddress.integration.test.ts` |
| `src/controllers/user/EnderecoController.ts` | `salvar` | `tests/unit/controllers/user/salvarEndereco.unit.test.ts` | `tests/integration/routes/saveAddress.integration.test.ts` |
| `src/controllers/user/ListUserByIdController.ts` | `handle` | `tests/unit/controllers/user/listUserById.unit.test.ts` | `tests/integration/routes/listUser.integration.test.ts` |
| `src/controllers/user/RequestPasswordResetController.ts` | `handle` | `tests/unit/controllers/user/requestPasswordReset.unit.test.ts` | `tests/integration/routes/requestPasswordReset.integration.test.ts` |
| `src/controllers/user/ResetPasswordController.ts` | `handle` | `tests/unit/controllers/user/resetPassword.unit.test.ts` | `tests/integration/routes/resetPassword.integration.test.ts` |
| `src/controllers/order/AprovarPagamentoController.ts` | `handle` | `tests/unit/controllers/order/approvePayment.unit.test.ts` | `tests/integration/routes/approvePayment.integration.test.ts` |
| `src/controllers/order/CheckoutController.ts` | `handle` | `tests/unit/controllers/order/checkout.unit.test.ts` | `tests/integration/routes/checkout.integration.test.ts` |
| `src/controllers/order/CreateOrderController.ts` | `handle` | `tests/unit/controllers/order/createOrder.unit.test.ts` | `tests/integration/routes/createOrder.integration.test.ts` |
| `src/controllers/order/DeletOrderController.ts` | `handle` | `tests/unit/controllers/order/deleteOrder.unit.test.ts` | `tests/integration/routes/deleteOrder.integration.test.ts` |
| `src/controllers/order/EnviarComprovanteController.ts` | `handle` | `tests/unit/controllers/order/sendReceipt.unit.test.ts` | `tests/integration/routes/sendReceipt.integration.test.ts` |
| `src/controllers/order/GetOrCreateCartController.ts` | `handle` | `tests/unit/controllers/order/getOrCreateCart.unit.test.ts` | `tests/integration/routes/getCart.integration.test.ts` |
| `src/controllers/order/ListMeusPedidosController.ts` | `handle` | `tests/unit/controllers/order/listMeusPedidos.unit.test.ts` | `tests/integration/routes/listMyOrders.integration.test.ts` |
| `src/controllers/order/ListPedidosPendentesController.ts` | `handle` | `tests/unit/controllers/order/listPedidosPendentes.unit.test.ts` | `tests/integration/routes/listPendingOrders.integration.test.ts` |
| `src/controllers/order/RejeitarPagamentoController.ts` | `handle` | `tests/unit/controllers/order/rejectPayment.unit.test.ts` | `tests/integration/routes/rejectPayment.integration.test.ts` |
| `src/controllers/order/SalesReportController.ts` | `handle` | `tests/unit/controllers/order/salesReport.unit.test.ts` | `tests/integration/routes/salesReport.integration.test.ts` |
| `src/controllers/order/UpdateOrderController.ts` | `handle` | `tests/unit/controllers/order/updateOrder.unit.test.ts` | `tests/integration/routes/updateOrder.integration.test.ts` |
| `src/controllers/order/VerComprovanteController.ts` | `handle` | `tests/unit/controllers/order/viewReceipt.unit.test.ts` | `tests/integration/routes/viewReceipt.integration.test.ts` |
| `src/modulos/pix/PixController.ts` | `gerarQrCode` | `tests/unit/controllers/pix/gerarQrCode.unit.test.ts` | `tests/integration/routes/getPaymentQr.integration.test.ts` |

## Services e utilitários Pix

| Arquivo de origem | Função/método | Arquivo unitário | Arquivo de integração |
|---|---|---|---|
| `src/services/category/CreateCategoryService.ts` | `execute` | `tests/unit/services/category/createCategory.unit.test.ts` | `tests/integration/routes/createCategory.integration.test.ts` |
| `src/services/category/ListCategoryService.ts` | `execute` | `tests/unit/services/category/listCategory.unit.test.ts` | `tests/integration/routes/listCategory.integration.test.ts` |
| `src/services/product/CreateProdutoServices.ts` | `execute` | `tests/unit/services/product/createProduct.unit.test.ts` | `tests/integration/routes/createProduct.integration.test.ts` |
| `src/services/product/DeletProductServices.ts` | `execute` | `tests/unit/services/product/deleteProduct.unit.test.ts` | `tests/integration/routes/deleteProduct.integration.test.ts` |
| `src/services/product/ListProdutoServices.ts` | `execute` | `tests/unit/services/product/listProduct.unit.test.ts` | `tests/integration/routes/listProduct.integration.test.ts` |
| `src/services/product/UpdateProdutoServices.ts` | `execute` | `tests/unit/services/product/updateProduct.unit.test.ts` | `tests/integration/routes/updateProduct.integration.test.ts` |
| `src/services/user/AuthGoogleUserService.ts` | `execute` | `tests/unit/services/user/authGoogleUser.unit.test.ts` | `tests/integration/routes/authGoogleUser.integration.test.ts` |
| `src/services/user/AuthUserService.ts` | `execute` | `tests/unit/services/user/authUser.unit.test.ts` | `tests/integration/routes/authUser.integration.test.ts` |
| `src/services/user/CreateUserServices.ts` | `execute` | `tests/unit/services/user/createUser.unit.test.ts` | `tests/integration/routes/createUser.integration.test.ts` |
| `src/services/user/ListUserByIdService.ts` | `execute` | `tests/unit/services/user/listUserById.unit.test.ts` | `tests/integration/routes/listUser.integration.test.ts` |
| `src/services/user/PasswordResetService.ts` | `solicitar` | `tests/unit/services/user/requestPasswordReset.unit.test.ts` | `tests/integration/routes/requestPasswordReset.integration.test.ts` |
| `src/services/user/PasswordResetService.ts` | `redefinir` | `tests/unit/services/user/resetPassword.unit.test.ts` | `tests/integration/routes/resetPassword.integration.test.ts` |
| `src/services/order/AprovarPagamentos.ts` | `execute` | `tests/unit/services/order/approvePayment.unit.test.ts` | `tests/integration/routes/approvePayment.integration.test.ts` |
| `src/services/order/CheckoutService.ts` | `execute` | `tests/unit/services/order/checkout.unit.test.ts` | `tests/integration/routes/checkout.integration.test.ts` |
| `src/services/order/CheckoutService.ts` | `getFreteEntrega` | `tests/unit/services/order/getFreight.unit.test.ts` | `tests/integration/routes/checkoutConfig.integration.test.ts` |
| `src/services/order/CreateOrderSerivices.ts` | `execute` | `tests/unit/services/order/createOrder.unit.test.ts` | `tests/integration/routes/createOrder.integration.test.ts` |
| `src/services/order/DeletOrderServices.ts` | `execute` | `tests/unit/services/order/deleteOrder.unit.test.ts` | `tests/integration/routes/deleteOrder.integration.test.ts` |
| `src/services/order/EnviarComprovanteServices.ts` | `execute` | `tests/unit/services/order/sendReceipt.unit.test.ts` | `tests/integration/routes/sendReceipt.integration.test.ts` |
| `src/services/order/GetOrCreateCartService.ts` | `execute` | `tests/unit/services/order/getOrCreateCart.unit.test.ts` | `tests/integration/routes/getCart.integration.test.ts` |
| `src/services/order/ListMeusPedidosService.ts` | `execute` | `tests/unit/services/order/listMeusPedidos.unit.test.ts` | `tests/integration/routes/listMyOrders.integration.test.ts` |
| `src/services/order/ListPedidosPendentesServices.ts` | `execute` | `tests/unit/services/order/listPedidosPendentes.unit.test.ts` | `tests/integration/routes/listPendingOrders.integration.test.ts` |
| `src/services/order/RejeitarPagamentoServices.ts` | `execute` | `tests/unit/services/order/rejectPayment.unit.test.ts` | `tests/integration/routes/rejectPayment.integration.test.ts` |
| `src/services/order/SalesReportService.ts` | `execute` | `tests/unit/services/order/salesReport.unit.test.ts` | `tests/integration/routes/salesReport.integration.test.ts` |
| `src/services/order/UpdateOrderServices.ts` | `execute` | `tests/unit/services/order/updateOrder.unit.test.ts` | `tests/integration/routes/updateOrder.integration.test.ts` |
| `src/services/order/WebhookMercadoPagoService.ts` | `execute` | `tests/unit/services/order/webhookMercadoPago.unit.test.ts` | — (não há rota registrada para o webhook) |
| `src/modulos/pix/PixServices.ts` | `normalizarTextoPix` | `tests/unit/services/pix/normalizarTextoPix.unit.test.ts` | `tests/integration/routes/checkout.integration.test.ts` |
| `src/modulos/pix/PixServices.ts` | `obterDadosRecebedorPix` | `tests/unit/services/pix/obterDadosRecebedorPix.unit.test.ts` | `tests/integration/routes/checkout.integration.test.ts` |
| `src/modulos/pix/PixServices.ts` | `gerarPayloadPix` | `tests/unit/services/pix/gerarPayloadPix.unit.test.ts` | `tests/integration/routes/checkout.integration.test.ts` |

## Middlewares, aplicação e utilitários

| Arquivo de origem | Função/método | Arquivo unitário | Arquivo de integração |
|---|---|---|---|
| `src/middlewares/isAdmin.ts` | `isAdmin` | `tests/unit/middlewares/isAdmin.unit.test.ts` | `tests/integration/routes/listPendingOrders.integration.test.ts` |
| `src/middlewares/isAuthenticated.ts` | `isAuthenticated` | `tests/unit/middlewares/isAuthenticated.unit.test.ts` | `tests/integration/routes/listUser.integration.test.ts` |
| `src/middlewares/verificaçãodeInformaçãoProduct.ts` | `Product` | `tests/unit/middlewares/productValidator.unit.test.ts` | — (não está aplicado às rotas atuais) |
| `src/middlewares/upload.ts` | `storage.filename` | `tests/unit/middlewares/uploadFilename.unit.test.ts` | `tests/integration/routes/createProduct.integration.test.ts` |
| `src/middlewares/upload.ts` | `fileFilter` | `tests/unit/middlewares/uploadFileFilter.unit.test.ts` | `tests/integration/routes/createProduct.integration.test.ts` |
| `src/middlewares/multerConfig.ts` | `storage.filename` | `tests/unit/middlewares/uploadReceiptFilename.unit.test.ts` | `tests/integration/routes/sendReceipt.integration.test.ts` |
| `src/middlewares/multerConfig.ts` | `fileFilter` | `tests/unit/middlewares/uploadReceiptFileFilter.unit.test.ts` | `tests/integration/routes/sendReceipt.integration.test.ts` |
| `src/app.ts` | `errorHandler` | `tests/unit/app/errorHandler.unit.test.ts` | `tests/integration/routes/updateProduct.integration.test.ts` |
| `src/app.ts` | callback de origem CORS | — | `tests/integration/routes/cors.integration.test.ts` |
| `src/app.ts` | callback de fallback 404 | — | `tests/integration/routes/notFound.integration.test.ts` |
| `src/app.ts` | callback de bloqueio de comprovantes legados | — | `tests/integration/routes/legacyReceiptPath.integration.test.ts` |
| `src/app.ts` | callback de headers para `/uploads` | — | `tests/integration/routes/uploadHeaders.integration.test.ts` |
| `src/utils/token.ts` | `gerarToken` | `tests/unit/utils/gerarToken.unit.test.ts` | `tests/integration/routes/authUser.integration.test.ts` |
| `src/utils/token.ts` | `normalizarEmail` | `tests/unit/utils/normalizarEmail.unit.test.ts` | `tests/integration/routes/createUser.integration.test.ts` |
| `src/routes.ts` | callback `GET /config/checkout` | — | `tests/integration/routes/checkoutConfig.integration.test.ts` |
| `src/routes.ts` | handler `POST /novousuario` | `tests/unit/controllers/user/createUser.unit.test.ts` | `tests/integration/routes/createUser.integration.test.ts` |
| `src/routes.ts` | handler `GET /listusuario` | `tests/unit/controllers/user/listUserById.unit.test.ts` | `tests/integration/routes/listUser.integration.test.ts` |
| `src/routes.ts` | handler `POST /sessao` | `tests/unit/controllers/user/authUser.unit.test.ts` | `tests/integration/routes/authUser.integration.test.ts` |
| `src/routes.ts` | handler `POST /sessao/google` | `tests/unit/controllers/user/authGoogleUser.unit.test.ts` | `tests/integration/routes/authGoogleUser.integration.test.ts` |
| `src/routes.ts` | handler `POST /senha/recuperar` | `tests/unit/controllers/user/requestPasswordReset.unit.test.ts` | `tests/integration/routes/requestPasswordReset.integration.test.ts` |
| `src/routes.ts` | handler `POST /senha/redefinir` | `tests/unit/controllers/user/resetPassword.unit.test.ts` | `tests/integration/routes/resetPassword.integration.test.ts` |
| `src/routes.ts` | handler `GET /endereco/usuario/:userId` | `tests/unit/controllers/user/buscarEnderecoUsuario.unit.test.ts` | `tests/integration/routes/getUserAddress.integration.test.ts` |
| `src/routes.ts` | handler `POST /endereco` | `tests/unit/controllers/user/salvarEndereco.unit.test.ts` | `tests/integration/routes/saveAddress.integration.test.ts` |
| `src/routes.ts` | handler `GET /endereco/:cep` | `tests/unit/controllers/user/buscarCep.unit.test.ts` | `tests/integration/routes/lookupCep.integration.test.ts` |
| `src/routes.ts` | handler `POST /novacategoria` | `tests/unit/controllers/category/createCategory.unit.test.ts` | `tests/integration/routes/createCategory.integration.test.ts` |
| `src/routes.ts` | handler `GET /listcategoria` | `tests/unit/controllers/category/listCategory.unit.test.ts` | `tests/integration/routes/listCategory.integration.test.ts` |
| `src/routes.ts` | handler `POST /novoproduto` | `tests/unit/controllers/product/createProduct.unit.test.ts` | `tests/integration/routes/createProduct.integration.test.ts` |
| `src/routes.ts` | handler `GET /listproduto` | `tests/unit/controllers/product/listProduct.unit.test.ts` | `tests/integration/routes/listProduct.integration.test.ts` |
| `src/routes.ts` | handler `DELETE /deletaproduto` | `tests/unit/controllers/product/deleteProduct.unit.test.ts` | `tests/integration/routes/deleteProduct.integration.test.ts` |
| `src/routes.ts` | handler `PUT /atualizaproduto` | `tests/unit/controllers/product/updateProduct.unit.test.ts` | `tests/integration/routes/updateProduct.integration.test.ts` |
| `src/routes.ts` | handler `GET /carrinho` | `tests/unit/controllers/order/getOrCreateCart.unit.test.ts` | `tests/integration/routes/getCart.integration.test.ts` |
| `src/routes.ts` | handler `POST /novopedido` | `tests/unit/controllers/order/createOrder.unit.test.ts` | `tests/integration/routes/createOrder.integration.test.ts` |
| `src/routes.ts` | handler `PUT /atualizapedido` | `tests/unit/controllers/order/updateOrder.unit.test.ts` | `tests/integration/routes/updateOrder.integration.test.ts` |
| `src/routes.ts` | handler `DELETE /deletapedido` | `tests/unit/controllers/order/deleteOrder.unit.test.ts` | `tests/integration/routes/deleteOrder.integration.test.ts` |
| `src/routes.ts` | handler `GET /meuspedidos` | `tests/unit/controllers/order/listMeusPedidos.unit.test.ts` | `tests/integration/routes/listMyOrders.integration.test.ts` |
| `src/routes.ts` | handler `POST /checkout` | `tests/unit/controllers/order/checkout.unit.test.ts` | `tests/integration/routes/checkout.integration.test.ts` |
| `src/routes.ts` | handler `GET /checkout/:compraId/qrcode` | `tests/unit/controllers/pix/gerarQrCode.unit.test.ts` | `tests/integration/routes/getPaymentQr.integration.test.ts` |
| `src/routes.ts` | handler `POST /checkout/:id_compra/comprovante` | `tests/unit/controllers/order/sendReceipt.unit.test.ts` | `tests/integration/routes/sendReceipt.integration.test.ts` |
| `src/routes.ts` | handler `GET /checkout/:id_compra/comprovante` | `tests/unit/controllers/order/viewReceipt.unit.test.ts` | `tests/integration/routes/viewReceipt.integration.test.ts` |
| `src/routes.ts` | handler `GET /pedidospendentes` | `tests/unit/controllers/order/listPedidosPendentes.unit.test.ts` | `tests/integration/routes/listPendingOrders.integration.test.ts` |
| `src/routes.ts` | handler `PATCH /aprovarpagamento/:id` | `tests/unit/controllers/order/approvePayment.unit.test.ts` | `tests/integration/routes/approvePayment.integration.test.ts` |
| `src/routes.ts` | handler `PATCH /rejeitarpagamento/:id` | `tests/unit/controllers/order/rejectPayment.unit.test.ts` | `tests/integration/routes/rejectPayment.integration.test.ts` |
| `src/routes.ts` | handler `GET /relatoriovendas` | `tests/unit/controllers/order/salesReport.unit.test.ts` | `tests/integration/routes/salesReport.integration.test.ts` |

## Código não coberto diretamente

- `src/prisma/index.ts`, `src/types/AuthRequest.ts` e `src/@types/express/index.d.ts` apenas instanciam ou declaram tipos; seus efeitos são exercitados indiretamente.
- `src/config/env.ts` é carregado no setup de integração com `NODE_ENV=test`; não há teste isolado que examine arquivos `.env`.
- `src/server.ts` apenas abre a porta e não é importado pelos testes, para evitar bind de porta; as rotas usam `app` exportado em `src/app.ts`.
- `prisma/make-admin.ts` é um script operacional executado diretamente, não um endpoint nem serviço importável sem efeitos colaterais.
- Integrações reais com Google, ViaCEP, SMTP e Mercado Pago não são chamadas nos testes; fluxos de domínio são cobertos por mocks unitários. O login Google de integração cobre ausência de credencial; o webhook Mercado Pago não possui rota registrada.
- Os casos de integração estão implementados, mas ainda não foram executados: `backend/.env.test` não está presente. O runner aborta antes de migration se o arquivo faltar ou se o nome do banco não contiver `test`.
