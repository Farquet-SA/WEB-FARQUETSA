from rest_framework.pagination import PageNumberPagination


class ProductPagination(PageNumberPagination):
    """
    Paginación para el catálogo de productos.
    El page_size se puede configurar desde el panel admin (/api/admin/configuracion/)
    """
    page_size = 8
    page_size_query_param = "page_size"
    max_page_size = 100

    def get_page_size(self, request):
        # Si el cliente pide explícitamente un page_size, respetarlo (hasta el máximo permitido)
        if self.page_size_query_param and self.page_size_query_param in request.query_params:
            return super().get_page_size(request)
        # De lo contrario, leer desde la configuración en BD
        try:
            from catalogo.models import ConfiguracionSistema
            config = ConfiguracionSistema.objects.filter(id=1).first()
            if config and config.productos_por_pagina > 0:
                return min(config.productos_por_pagina, self.max_page_size)
        except Exception:
            pass
        return self.page_size
    