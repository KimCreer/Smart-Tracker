<?php
session_start();

// Google API credentials
$clientID = "433023796706-a8kt3pllaaapl1td9prfnt7gfd08g1rn.apps.googleusercontent.com"; // Your client ID
$clientSecret = "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T"; // Replace with your client secret

// Get the token sent from the client
$token = $_POST['token'];

if (!$token) {
    echo json_encode(['success' => false, 'message' => 'Token is missing.']);
    exit();
}

// Verify the token with Google API
$verificationUrl = "https://oauth2.googleapis.com/tokeninfo?id_token=" . $token;

$response = file_get_contents($verificationUrl);
$userData = json_decode($response, true);

// If the response does not contain valid user data
if (isset($userData['error'])) {
    echo json_encode(['success' => false, 'message' => 'Invalid token.']);
    exit();
}

// If token is valid, you can now use the user data
$userInfo = [
    'email' => $userData['email'],
    'name' => $userData['name'],
    'picture' => $userData['picture'],
    'id' => $userData['sub'] // Google unique user ID
];

// Store user data in session or database as needed
$_SESSION['user'] = $userInfo;

// Respond with user info
echo json_encode(['success' => true, 'userInfo' => $userInfo]);
?>
