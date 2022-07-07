// function add_to_cart(proId){
//     $.ajax({
//         url:'/add-tocart/'+proId,
//         method:'get',   
//         success:(response)=>{
//             if(response.status){
//                 let count=$('#cart-count').html()
//                 counts=parseInt(count)+1
//                 $('#cart-count').html(counts)
//             }   
//         }
//     })
// }

function add_to_cart(proId){
    $.ajax({
        url:'/add-tocart/'+proId,
        method:'get',   
        success:(response)=>{
            if(response.status){
                Swal.fire(
                    'added to Cart!',
                    'product added to Cart.',
                    'success'
                )
                let count=$('#cart-count').html()
                counts=parseInt(count)+1
                $('#cart-count').html(counts)
                
            }else{
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Please Login!',
                    footer: '<a href="/login">Login</a>'
                  })
            }
          
            
            
        }
    })
}

    // function addTowishlist(proId){
	// 	$.ajax({
	// 		url:'/add-Towishlist/'+proId,
	// 		method:'get',
		
	// 		success:(response)=>{
	// 			alert(response)
				
	// 		}
	// 	})
	// }
    function add_to_wishlist(proId){
        $.ajax({
            url:'/add-towishlist/'+proId,
            method:'get',   
            success:(response)=>{
                if(response.status){
                    Swal.fire(
                        'added to Wishlist!',
                        'product added to wish.',
                        'success'
                    )
                    let count=$('#wish-count').html()
                    counts=parseInt(count)+1
                    $('#wish-count').html(counts)
                    
                }else{
                    Swal.fire({
                        icon: 'error',
                        title: 'Oops...',
                        text: 'Please Login!',
                        footer: '<a href="/login">Login</a>'
                      })
                }    
            }
        })
    }
    
	
	

