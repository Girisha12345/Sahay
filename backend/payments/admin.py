from django.contrib import admin

from payments.models import Payment, ProviderWallet, WalletTransaction

admin.site.register(Payment)
admin.site.register(ProviderWallet)
admin.site.register(WalletTransaction)
