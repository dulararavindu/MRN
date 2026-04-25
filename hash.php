<?php
$hash_password123 = password_hash('password123', PASSWORD_BCRYPT);
$hash_12345 = password_hash('12345', PASSWORD_BCRYPT);

echo "Hash for 'password123':\n";
echo $hash_password123 . "\n\n";
echo "Hash for '12345':\n";
echo $hash_12345 . "\n\n";

// Verify they work correctly
echo "Verify 'password123': " . (password_verify('password123', $hash_password123) ? 'OK' : 'FAIL') . "\n";
echo "Verify '12345': " . (password_verify('12345', $hash_12345) ? 'OK' : 'FAIL') . "\n";
?>
