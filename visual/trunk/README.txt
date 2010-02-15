README for the Visual adaptation to Jon Bevan's Programming environment for 
Adaptation Language tool.

Server Requirements:

 *  Apache (probably. Only tested on Apache anyway)
 *  PHP
 *  Mysql database, 1 table, 1 user
 *  ./users/ must be owned by the user that PHP runs as (often the web 
        server's user) for the PHP chmod function called during installation 
        to work.
 *  php/db_config.php must be writable by the user that PHP runs as (often the 
        web server's user)
        
Client requirements:

 *  Firefox 3 (Other browsers and versions untested or currently have limited 
        support)
 *  Javascript enabled
 *  Usable on low-end computers e.g. 1400 MHz CPU, 500Mb RAM. Much smoother 
        on systems with more CPU power.

Instructions:

 1. Copy all files to the web server directory e.g. public_html
 2. Visit install.php