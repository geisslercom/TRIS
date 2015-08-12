'use strict';

//On Click Listener
$('#regHookForm').on('click',function (e) {
		var hookid   = $('input[name="hookid"]').val();
		var hooktype = $('select[name="hooktype"]').val();

		$.get('/reg/'+hookid+'/'+hooktype,function (res) {
			$('input[name="hookid"]').val('');
			console.log(res);
			$('#regHookForm').append('<p>'+res+'</p>');
		});
		
});