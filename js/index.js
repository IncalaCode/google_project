// // // var dropZone = document.getElementById('dropZone');

// // // function showDropZone() {
// // //     dropZone.style.visibility = "visible";
// // // }
// // // function hideDropZone() {
// // //     dropZone.style.visibility = "hidden";
// // // }

// // // function allowDrag(e) {
// // //     if (true) {  // Test that the item being dragged is a valid one
// // //         e.dataTransfer.dropEffect = 'copy';
// // //         e.preventDefault();
// // //     }
// // // }

// // // function handleDrop(e) {
// // //     e.preventDefault();
// // //     hideDropZone();

// // //     alert('Drop!');
// // // }

// // // // 1
// // // window.addEventListener('dragenter', function(e) {
// // //     showDropZone();
// // // });

// // // // 2
// // // dropZone.addEventListener('dragenter', allowDrag);
// // // dropZone.addEventListener('dragover', allowDrag);

// // // // 3
// // // dropZone.addEventListener('dragleave', function(e) {
// // //     hideDropZone();
// // // });

// // // // 4
// // // dropZone.addEventListener('drop', handleDrop);



// // const dropZone = document.getElementById('dropZone');

// // function showDropZone() {
// //     dropZone.style.visibility = "visible";
// // }

// // function hideDropZone() {
// //     dropZone.style.visibility = "hidden";
// // }

// // function allowDrag(e) {
// //     e.dataTransfer.dropEffect = 'copy';
// //     e.preventDefault();
// // }

// // function handleDrop(e) {
// //     e.preventDefault();
// //     hideDropZone();
// // }

// // // 1
// // window.addEventListener('dragenter', function(e) {
// //     showDropZone();
// // });

// // // 2
// // dropZone.addEventListener('dragenter', allowDrag);
// // dropZone.addEventListener('dragover', allowDrag);
// // dropZone.addEventListener('dragleave', hideDropZone);
// // dropZone.addEventListener('drop', handleDrop);

// // dropZone.addEventListener('drop', function(e) {
// //     alert('File has been dropped!');
// // });
// // dropZone.addEventListener('dragover', function(e) {
// //     e.preventDefault();
// //     dropZone.classList.add('dragover');
// // });

// // dropZone.addEventListener('dragleave', function(e) {
// //     e.preventDefault();
// //     dropZone.classList.remove('dragover');
// // });

// // dropZone.addEventListener('drop', function(e) {
// //     e.preventDefault();
// //     dropZone.classList.remove('dragover');
// //     handleDrop(e);
// // });

// var div = document.createElement('div');
// return ('draggable' in div) || ('ondragstart' in div && 'ondrop' in div)

// return 'FormData' in window;
// 'FileReader' in window;

// var isAdvancedUpload = function() {
//     var div = document.createElement('div');
//     return (('draggable' in div) || ('ondragstart' in div && 'ondrop' in div)) && 'FormData' in window && 'FileReader' in window;
//   }();

//   if (isAdvancedUpload) {

//     var droppedFiles = false;
  
//     $form.on('drag dragstart dragend dragover dragenter dragleave drop', function(e) {
//       e.preventDefault();
//       e.stopPropagation();
//     })
//     .on('dragover dragenter', function() {
//       $form.addClass('is-dragover');
//     })
//     .on('dragleave dragend drop', function() {
//       $form.removeClass('is-dragover');
//     })
//     .on('drop', function(e) {
//       droppedFiles = e.originalEvent.dataTransfer.files;
//     });
  
//   }

//   var $form = $('.box');

// if (isAdvancedUpload) {
//   $form.addClass('has-advanced-upload');
// }

// $form.on('submit', function(e) {
//     if ($form.hasClass('is-uploading')) return false;
  
//     $form.addClass('is-uploading').removeClass('is-error');
  
//     if (isAdvancedUpload) {
//       // ajax for modern browsers
//     } else {
//       // ajax for legacy browsers
//     }
//   });

// //   var $progress = $form.find('.progress');

//   var $input    = $form.find('input[type="file"]'),
//   $label    = $form.find('label'),
//   showFiles = function(files) {
//     $label.text(files.length > 1 ? ($input.attr('data-multiple-caption') || '').replace( '{count}', files.length ) : files[ 0 ].name);
//   };

// // ...

// on('drop', function(e) {
// droppedFiles = e.originalEvent.dataTransfer.files; // the files that were dropped
// showFiles( droppedFiles );
// });

// //...

// $input.on('change', function(e) {
// showFiles(e.target.files);
// });


//,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,



(function(e,t,n){var r=e.querySelectorAll("html")[0];r.className=r.className.replace(/(^|\s)no-js(\s|$)/,"$1js$2")})(document,window,0);




'use strict';

	;( function ( document, window, index )
	{
		// feature detection for drag&drop upload
		var isAdvancedUpload = function()
			{
				var div = document.createElement( 'div' );
				return ( ( 'draggable' in div ) || ( 'ondragstart' in div && 'ondrop' in div ) ) && 'FormData' in window && 'FileReader' in window;
			}();


		// applying the effect for every form
		var forms = document.querySelectorAll( '.box' );
		Array.prototype.forEach.call( forms, function( form )
		{
			var input		 = form.querySelector( 'input[type="file"]' ),
				label		 = form.querySelector( 'label' ),
				errorMsg	 = form.querySelector( '.box__error span' ),
				restart		 = form.querySelectorAll( '.box__restart' ),
				droppedFiles = false,
				showFiles	 = function( files )
				{
					label.textContent = files.length > 1 ? ( input.getAttribute( 'data-multiple-caption' ) || '' ).replace( '{count}', files.length ) : files[ 0 ].name;
				},
				triggerFormSubmit = function()
				{
					var event = document.createEvent( 'HTMLEvents' );
					event.initEvent( 'submit', true, false );
					form.dispatchEvent( event );
				};

			// letting the server side to know we are going to make an Ajax request
			var ajaxFlag = document.createElement( 'input' );
			ajaxFlag.setAttribute( 'type', 'hidden' );
			ajaxFlag.setAttribute( 'name', 'ajax' );
			ajaxFlag.setAttribute( 'value', 1 );
			form.appendChild( ajaxFlag );

			// automatically submit the form on file select
			input.addEventListener( 'change', function( e )
			{
				showFiles( e.target.files );

				
			});

			// drag&drop files if the feature is available
			if( isAdvancedUpload )
			{
				form.classList.add( 'has-advanced-upload' ); // letting the CSS part to know drag&drop is supported by the browser

				[ 'drag', 'dragstart', 'dragend', 'dragover', 'dragenter', 'dragleave', 'drop' ].forEach( function( event )
				{
					form.addEventListener( event, function( e )
					{
						// preventing the unwanted behaviours
						e.preventDefault();
						e.stopPropagation();
					});
				});
				[ 'dragover', 'dragenter' ].forEach( function( event )
				{
					form.addEventListener( event, function()
					{
						form.classList.add( 'is-dragover' );
					});
				});
				[ 'dragleave', 'dragend', 'drop' ].forEach( function( event )
				{
					form.addEventListener( event, function()
					{
						form.classList.remove( 'is-dragover' );
					});
				});
				form.addEventListener( 'drop', function( e )
				{
					droppedFiles = e.dataTransfer.files; // the files that were dropped
					showFiles( droppedFiles );

									});
			}


			// if the form was submitted
			form.addEventListener( 'submit', function( e )
			{
				// preventing the duplicate submissions if the current one is in progress
				if( form.classList.contains( 'is-uploading' ) ) return false;

				form.classList.add( 'is-uploading' );
				form.classList.remove( 'is-error' );

				if( isAdvancedUpload ) // ajax file upload for modern browsers
				{
					e.preventDefault();

					// gathering the form data
					var ajaxData = new FormData( form );
					if( droppedFiles )
					{
						Array.prototype.forEach.call( droppedFiles, function( file )
						{
							ajaxData.append( input.getAttribute( 'name' ), file );
						});
					}

					// ajax request
					var ajax = new XMLHttpRequest();
					ajax.open( form.getAttribute( 'method' ), form.getAttribute( 'action' ), true );

					ajax.onload = function()
					{
						form.classList.remove( 'is-uploading' );
						if( ajax.status >= 200 && ajax.status < 400 )
						{
							var data = JSON.parse( ajax.responseText );
							form.classList.add( data.success == true ? 'is-success' : 'is-error' );
							if( !data.success ) errorMsg.textContent = data.error;
						}
						else alert( 'Error. Please, contact the webmaster!' );
					};

					ajax.onerror = function()
					{

						form.classList.remove( 'is-uploading' );
						// 
						// window.location.href = "second_html.html";
						window.location.href = "../second_page.html";
						var fd = new FormData();
						fd.append("file", droppedFiles[0]);
						var xhr = new XMLHttpRequest();
						xhr.open("POST", "../second_page.html", true);
						xhr.send(fd);

					};

					ajax.send( ajaxData );
				}
				else // fallback Ajax solution upload for older browsers
				{
					var iframeName	= 'uploadiframe' + new Date().getTime(),
						iframe		= document.createElement( 'iframe' );

						$iframe		= $( '<iframe name="' + iframeName + '" style="display: none;"></iframe>' );

					iframe.setAttribute( 'name', iframeName );
					iframe.style.display = 'none';

					document.body.appendChild( iframe );
					form.setAttribute( 'target', iframeName );

					iframe.addEventListener( 'load', function()
					{
						var data = JSON.parse( iframe.contentDocument.body.innerHTML );
						form.classList.remove( 'is-uploading' )
						form.classList.add( data.success == true ? 'is-success' : 'is-error' )
						form.removeAttribute( 'target' );
						if( !data.success ) errorMsg.textContent = data.error;
						iframe.parentNode.removeChild( iframe );
					});
				}
			});


			// restart the form if has a state of error/success
			Array.prototype.forEach.call( restart, function( entry )
			{
				entry.addEventListener( 'click', function( e )
				{
					e.preventDefault();
					form.classList.remove( 'is-error', 'is-success' );
					input.click();
				});
			});

			// Firefox focus bug fix for file input
			input.addEventListener( 'focus', function(){ input.classList.add( 'has-focus' ); });
			input.addEventListener( 'blur', function(){ input.classList.remove( 'has-focus' ); });

		});
	}( document, window, 0 ));


	// Redirect user to the second_page.html after a successful file upload
	// document.querySelector('form').addEventListener('submit', function(event) {
	//   event.preventDefault();
	//   var form = this;
	//   var xhr = new XMLHttpRequest();
	//   xhr.open('POST', form.action);
	//   xhr.setRequestHeader('Accept', 'application/json');
	//   xhr.onreadystatechange = function() {
	//     if (xhr.readyState === 4 && xhr.status === 200) {
	//       // File uploaded successfully
	//       window.location.href = 'second_page.html';
	//     }
	//   };
	//   xhr.send(new FormData(form));
	// });
