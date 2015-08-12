'use strict';

//On Click Listener
$('#regHookForm').on('click',function (e) {
		var listid1   = $('input[name="list1"]').val();
		var listid2   = $('input[name="list2"]').val();
		console.log('firing Sync Form with: '+listid1+" "+listid2);


		$.get('/sync/'+listid1+'/'+listid2,{},function (res) {
			$('input[name="list1"]').val('');
			$('input[name="list2"]').val('');
			$('#regHookForm').append('<p>'+res+'</p>');
		});
		
});