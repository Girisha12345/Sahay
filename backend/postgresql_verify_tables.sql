\c sahay_db

SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'accounts_user',
    'services_category',
    'services_service',
    'bookings_booking',
    'payments_payment',
    'chat_message',
    'reviews_review'
  )
ORDER BY tablename;
