var api = "https://tngis.tnega.org/cadastral_api/app/api/v1/";
var nonceValue;
getrandom();
$('#login_official').on('submit',function(e){
	e.preventDefault();
	var user = $('#uname').val();
   var password   = $('#pass').val();

	// Encrypt form data
	let encryption = new Encryption();
	var unameEncrypted = encryption.encrypt(user, nonceValue);
	var passwordEncrypted = encryption.encrypt(password, nonceValue);
	document.getElementById("uname").value = unameEncrypted;
	document.getElementById("pass").value = passwordEncrypted;
	$('#submit').attr('disabled',true);
	var login_data = $('#login_official').serialize();
	$.ajax({
      type: "POST",
      headers: { 'X-APP-KEY': 'fmbMa$ter!' },
      url:""+api+"/login.php",
      dataType: "json",
      data: login_data,
      processData: false, 
      success: function (data){
         if(data.message == 'success')
         {
         	$('.loginModal').modal('hide');
            const toast = new bootstrap.Toast(document.getElementById('successToast'))
            toast.show()
            $('.login_btn').addClass('d-none');
            $('.logout').removeClass('d-none');
            has_login = true;
         }
         if(data.message == 'error')
         {
         	$('#submit').attr('disabled',false);
            const toast = new bootstrap.Toast(document.getElementById('errorToast'))
            toast.show()
            $('#uname').val('');
   			$('#pass').val('');
   			$('#textBox').val('');
   			has_login = false;
         }
      },
      error:function (err) {   
         //alert(err);
      }
   });
});
$('.logout').on('click',function(){
	$.ajax({
      type: "POST",
      headers: { 'X-APP-KEY': 'fmbMa$ter!' },
      url:""+api+"/login.php",
      dataType: "json",
      data: {'case':'logout'},
      success: function (data){
         if(data.message == true)
         {
         	has_login = false;
            const toast = new bootstrap.Toast(document.getElementById('logoutToast'))
            toast.show()
            $('.login_btn').removeClass('d-none');
            $('.logout').addClass('d-none');
            $('#uname').val('');
   			$('#pass').val('');
   			$('#textBox').val('');
         }
      },
      error:function (err) {   
         //alert(err);
      }
   });
});
function getrandom()
{
	$.ajax({
		type:"POST",
      headers: { 'X-APP-KEY': 'fmbMa$ter!' },
      url:""+api+"/login.php",
		dataType:'json',
		data:{'case':'getrandom'},
		success:function(result){
			nonceValue = result.nonceValue;
			$('#check_value').val(nonceValue);
			/*if(result.check_login == true)
			{
				$('.login_btn').addClass('d-none')
				$('.logout').removeClass('d-none');
			}*/
		}
	});
}