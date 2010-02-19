install:
    rsync -iruz --exclude=".svn" . /var/www/visual
    chown www-data /var/www/visual/users
    chown www-data /var/www/visual/php/db_config.php
    
update:
    rsync -iruz --exclude=".svn" . /var/www/visual