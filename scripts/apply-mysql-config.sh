#!/bin/bash
# Script untuk menerapkan konfigurasi MySQL

# Deteksi OS
if [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
    # Windows
    MYSQL_CONF_DIR="/c/ProgramData/MySQL/MySQL Server 8.0"
    CONFIG_FILE="my.ini"
else
    # Linux/Mac
    MYSQL_CONF_DIR="/etc/mysql/conf.d"
    CONFIG_FILE="custom.cnf"
fi

# Copy konfigurasi
echo "Copying MySQL configuration..."
if [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
    # Windows - gunakan administator privileges
    runas /user:Administrator "cp ./config/mysql.cnf ${MYSQL_CONF_DIR}/${CONFIG_FILE}"
else
    # Linux/Mac
    sudo cp ./config/mysql.cnf ${MYSQL_CONF_DIR}/${CONFIG_FILE}
fi

# Restart MySQL service
echo "Restarting MySQL service..."
if [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
    # Windows
    net stop MySQL80
    net start MySQL80
else
    # Linux/Mac
    sudo systemctl restart mysql
fi

echo "MySQL configuration has been applied successfully!"
echo "You can verify the configuration by running: mysql --help"