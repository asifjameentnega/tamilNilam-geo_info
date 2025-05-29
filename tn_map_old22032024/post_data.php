<?php 
	
	if(isset($_POST['service_name']))
	{
		echo 'service_name = '.$_POST['service_name'];
		echo ' district_code = '.$_POST['district_code'];
		echo ' taluk_code = '.$_POST['taluk_code'];
		echo ' village_code = '.$_POST['village_code'];
		echo ' survey = '.$_POST['survey'];
		echo ' subdivision = '.$_POST['subdivision'];
		if(isset($_POST['patta_number_enter']))
		{
			echo ' patta_number = '.$_POST['patta_number_enter'];
		}
	}
?>