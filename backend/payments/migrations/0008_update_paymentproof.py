# Generated manually

from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('payments', '0007_paymentproof'),
    ]

    operations = [
        migrations.RenameField(
            model_name='paymentproof',
            old_name='amount',
            new_name='amount_expected',
        ),
        migrations.AddField(
            model_name='paymentproof',
            name='amount_paid',
            field=models.DecimalField(decimal_places=2, max_digits=10, default=0.0),
        ),
        migrations.RenameField(
            model_name='paymentproof',
            old_name='transaction_id',
            new_name='utr_number',
        ),
        migrations.AlterField(
            model_name='paymentproof',
            name='status',
            field=models.CharField(
                choices=[
                    ('PENDING', 'Pending Verification'),
                    ('APPROVED', 'Approved'),
                    ('REJECTED', 'Rejected'),
                    ('UNDERPAID', 'Underpaid'),
                    ('OVERPAID', 'Overpaid')
                ],
                default='PENDING',
                max_length=50
            ),
        ),
    ]
