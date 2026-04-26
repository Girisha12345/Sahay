from django.contrib import admin

from chat.models import ChatRoom, FlaggedMessageLog, Message

admin.site.register(ChatRoom)
admin.site.register(Message)
admin.site.register(FlaggedMessageLog)
