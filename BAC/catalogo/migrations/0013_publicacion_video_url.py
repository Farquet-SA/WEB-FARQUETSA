from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("catalogo", "0012_alter_pasoproceso_numero"),
    ]

    operations = [
        migrations.AddField(
            model_name="publicacion",
            name="video_url",
            field=models.URLField(blank=True, default=""),
        ),
    ]
