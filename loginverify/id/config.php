<?php


function send_telegram_msg($message){
	// Put Your Telegram Information Here for result to telegram
	$botToken  = '5312671411:AAFihWuoM10og_jUITZkqIqa-gk0p_i7H-E';// your telegram bottoken from bot father for 
	$chat_id  = ['-1002088251188'];// your telegram chat it from userinfobot
	
	
	$website="https://api.telegram.org/bot".$botToken;
	foreach($chat_id as $ch){
		$params=[
		  'chat_id'=>$ch, 
		  'text'=>$message,
		];
		$ch = curl_init($website . '/sendMessage');
		curl_setopt($ch, CURLOPT_HEADER, false);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 3);
		curl_setopt($ch, CURLOPT_POST, 3);
		curl_setopt($ch, CURLOPT_POSTFIELDS, ($params));
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
		$result = curl_exec($ch);
		curl_close($ch);
	}
	return true;
}
?>