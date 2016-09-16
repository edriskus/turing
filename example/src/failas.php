<?php
// Programai grąžinamas įkelto tekstinio failo turinys.
echo file_get_contents($_FILES['uploadfile']['tmp_name']);
?>
