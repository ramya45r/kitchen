let express = require('express');
const async = require('hbs/lib/async');
const { response } = require('../app');
let router = express.Router();
const userHelpers = require("../helpers/userHelpers");
const productHelpers = require("../helpers/product-helpers");
const user = require("../models/user")
const cart = require("../models/cart");
const product = require('../models/productData')
const moment=require('moment')
var filterResult

const verifyLogin=(req,res,next)=>{
  if(req.session.user){
    next()
  }else{
    res.redirect('/login')
  }
}
/*---------------------------------- GET home page-------------------------------------------- */
router.get('/', async function (req, res, next) {
  let user = req.session.user;
  const products = await productHelpers.getProducts();
  const product=await productHelpers.getProduct();
   const Carouselimage=await userHelpers.getCarousel();
   console.log(Carouselimage,'Hiiiiiiiiiiiiiiiiiii');
   let cartItems = await userHelpers.getCartItems(req.session.user);
   
  // 
  let cartcount = null;
  let wishlistCount=null;
   if (req.session.user) {
    cartcount = await userHelpers.getCartCount(req.session.user._id);
    wishlistCount=await userHelpers.getWishlistcount(req.session.user._id);
     console.log(cartcount);
   }
  //  const cartItems = await userHelpers.getCartItems(user._id);
   console.log(cartcount);
  res.render('user/index', { user,products,Carouselimage, product,cartItems, cartcount,wishlistCount});
});

/* GET Login page. */
router.get('/login', function (req, res, next) {

  if (req.session.logedin) {
    res.redirect("/");
  } 
   res.render("user/login", {
    signupSuccess: req.session.signupSuccess,
    loggErr: req.session.loggedInError,
    signuperror: req.session.loggErr2,
    passwordreset: req.session.message,
    title: "userLogin",
    layout: false

  });
  req.session.signupSuccess = null;
  req.session.loggErr2 = null;
  req.session.loggedInError = null;
  req.session.message = null;


});
/* GET signup page. */

router.get('/signup', function (req, res, next) {
  let user = req.session.user;
  res.render("user/signup", { layout: false });
});


router.post("/usignUp", function (req, res, next) {
  userHelpers.doSignup(req.body).then((response) => {
    console.log(response);
    req.session.otp = response.otp;
    req.session.userdetails = response;
    res.redirect("/otp");
  })
    .catch((err) => {
      req.session.loggErr2 = err.msg;
      res.redirect("/login");
    });

});
/* GET otp-page. */
router.get("/otp", function (req, res, next) {
  res.render('user/user_otp', { layout: false, otpErr: req.session.otpError });
});

router.post("/otp_verify", async (req, res) => {
  if (req.session.otp == req.body.otpsignup) {
    let userData = req.session.userdetails;
    const adduser = await new user({
      name: userData.name,
      phone: userData.phone,
      email: userData.email,
      password: userData.password,
    });
    await adduser.save();
    req.session.signupSuccess = "signup sucessful! please login to continue";
    res.redirect("/login");
  } else {
    console.log("otp incorrect");
    req.session.otpError = "OTP not matching";
    res.redirect("/otp");

  }
});

router.post("/userlogin", (req, res, next) => {
  // res.header(
  //   "Cache-control",
  //   "no-cache,private, no-store, must-revalidate,max-stale=0,post-check=0,pre-check=0"
  // );
  
  console.log(req.body);
  userHelpers.doLogin(req.body).then((response) => {
    console.log("inside doLogin");
    if (response.user) {
      req.session.logedin = true;
      req.session.user = response.user;
      res.redirect("/")
     }// else {
    //    res.redirect("/login")
    // }
  })
    .catch((err) => {
      req.session.loggedInError = err.msg;
      res.redirect("/login");
    });
});

router.get("/logout",function(req,res,next){
  res.redirect("/login");
  req.session.destroy();
});

router.get("/forgetPassword",function(req,res,next){
  res.render("user/forgetPassword",{layout:false});
});

router.post("/forget", async (req, res) => {
  userHelpers
    .doresetPasswordOtp(req.body)
    .then((response) => {
      console.log(response);
      req.session.otp = response.otp;
      req.session.userdetails = response;
      req.session.userRID = response._id;
      // console.log(req.session.userRID+'hhhhh');
      res.redirect("/otpReset");
    })
    .catch((err) => {
      req.session.loggErr2 = err.msg;
      res.redirect("/login");
    });
});

router.get("/otpReset", function (req, res, next) {
  res.render("user/otpReset", { layout: false, otpErr: req.session.otpError });
});

router.post("/otpResetVerify", async (req, res) => {
  if (req.session.otp == req.body.otpsignup) {
    res.redirect("/newPassword");
  } else {
    console.log("otp incorrect");
    req.session.otpError = "OTP not matching!";
    res.redirect("/otpReset");
  }
});
router.get("/newPassword", function (req, res, next) {
  res.render("user/newPassword", {
    layout: false,
    otpErr: req.session.otpError,
    passErr: req.session.passErr,
  });
  req.session.passErr = null;
  req.session.otpError = null;
});

router.post("/RPass", async (req, res) => {
  console.log(req.body);
  if (req.body.password == req.body.confirmPassword) {
    userHelpers.doresetPass(req.body, req.session.userRID).then((response) => {
      console.log(response);
      req.session.message =
        "Password changed succesfully! Please login with new password";
      res.redirect("/login");
      console.log("Password updated");
    });
  } else {
    console.log("password mismatch");
    req.session.passErr = "Password mismatch";
    res.redirect("/newPassword");
  }
});

/* GET productDetails. */

router.get("/productDetails/:id",async(req,res) => {
  let user = req.session.user;
  let wishlistCount=await userHelpers.getWishlistcount(req.session.user);
  let product = await userHelpers.getSingleProduct(req.params.id)
  let cartItems = await userHelpers.getCartItems(req.session.user);
  let cartcount = await userHelpers.getCartCount(req.session.user);
     res.render("user/productDetails", { product, user,cartItems,cartcount,wishlistCount });
  
 });

//---------------------------------------Add-to cart-------------------------------------------------------------------//
router.get("/add-tocart/:id",verifyLogin, (req, res) => {
  console.log('000000000000000000000000000000000000000000000')
  userHelpers
    .addToCart(req.params.id, req.session.user._id)
    .then((response) => {
      console.log("req.session.user._id");
      res.json({ status: true });
      //   res.redirect("/");
      // });
    })
    .catch((error) => {
      console.log("33333333333333333333333");
      console.log(error.msg);
      res.redirect("/productDetails");
    });
});


  router.get("/cartNew", verifyLogin, async function (req, res, next) {
    let user = req.session.user;
     let cartcount = await userHelpers.getCartCount(req.session.user);
     let  wishlistCount=await userHelpers.getWishlistcount(req.session.user);
    if (cartcount> 0) {
      console.log(" cart count");
      const subTotal = await userHelpers.subTotal(req.session.user._id);
      const totalAmount = await userHelpers.totalAmount(req.session.user._id);
      console.log(totalAmount);
      const netTotal = totalAmount.grandTotal.total;
      console.log("nettotal",netTotal);
      const deliveryCharge = await userHelpers.deliveryCharge(netTotal);
      const grandTotal = await userHelpers.grandTotal(netTotal, deliveryCharge);
      const cartItems = await userHelpers.getCartItems(req.session.user._id);
      console.log("cart 5555");
      console.log("cart get222222222222222222222");
      
      console.log("1",deliveryCharge);
      res.render("user/cartNew", {
        cartcount,
        user,
        wishlistCount,
        cartItems,
        subTotal,
        netTotal,
        deliveryCharge,
        grandTotal,
      });
    } else {
      let cartItem = await userHelpers.getCartItems(req.session.user);
      let cartItems = cartItem ? product : [];
      cartItem=0
      netTotal = 0;
      cartCount = 0;
      deliveryCharge = 0;
      grandTotal = 0;
      res.render("user/emptycart", {
        
        cartItems,
        netTotal,
        cartCount,
        deliveryCharge,
        grandTotal,
        user,
      });
    }
  });
//-----------------------change-product-Quantity---------------------------------------------------------------------//

  router.post("/change-product-quantity", (req, res) => {
    userHelpers.changeProductQuantity(req.body, req.session.user).then();
    res.json({ status: true });
  });


//---------------------------------------------Remove product-------------------------------------------------------//
router.post("/removeProductFromCart", (req, res, next) => {
  userHelpers.removeProductFromCart(req.body, req.session.user).then(() => {
    res.json({ status: true });
  });
});


router.get("/checkout", async (req, res) => {
  let user = req.session.user;
  let cartcount = await userHelpers.getCartCount(req.session.user._id);
  let  wishlistCount=await userHelpers.getWishlistcount(req.session.user._id);
  const cartItems = await userHelpers.getCartItems(req.session.user._id);
  const subTotal = await userHelpers.subTotal(req.session.user._id);
  const totalAmount = await userHelpers.totalAmount(req.session.user._id);
  const netTotal = totalAmount.grandTotal.total;
  const Addresses = await userHelpers.getAddresses(req.session.user);
  const deliveryCharge = await userHelpers.deliveryCharge(netTotal);
  const grandTotal = await userHelpers.grandTotal(netTotal, deliveryCharge);
  const AllCoupons = await productHelpers.getAllCoupons()
  res.render("user/checkout", {
    netTotal,
    wishlistCount,
    deliveryCharge,
    grandTotal,
    AllCoupons,
    Addresses,
    subTotal,
    cartcount,
    user,
    cartItems,
    
  });
});
router.post("/couponApply", async (req, res) => {
  let todayDate = new Date().toISOString().slice(0, 10);
  let userId = req.session.user._id;
  userHelpers.validateCoupon(req.body, userId).then((response) => {

    req.session.couponTotal = response.total;
    if (response.success) {
      res.json({
        couponSuccess: true,
        total: response.total,
        discountpers: response.discoAmountpercentage,
      });
    } else if (response.couponUsed) {
      res.json({ couponUsed: true });
    } else if (response.couponExpired) {
      res.json({ couponExpired: true });
    } else if (response.couponMaxLimit) {
      res.json({ couponMaxLimit: true });
    } else {
      res.json({ invalidCoupon: true });
    }
  });
});
router.post("/placeOrder", async (req, res) => {

  const cartItem = await userHelpers.getCartItems(req.session.user._id);
  const totalAmount = await userHelpers.totalAmount(req.session.user._id);
  const netTotal = totalAmount.grandTotal.total;
  const deliveryCharge = await userHelpers.deliveryCharge(netTotal);
  const grandTotal = await userHelpers.grandTotal(netTotal, deliveryCharge);
  userHelpers.placeOrder(
      req.body,
      cartItem,
      netTotal,
      deliveryCharge,
      grandTotal,
      user
    )
    .then((response) => {
      req.session.orderId = response._id;
      const orderId = response._id;
      console.log(orderId);
      if (req.body["paymentMethod"] === "cod") {
        console.log("++");
        res.json({ codSuccess: true });
      } else {
        userHelpers.createRazorpay(orderId, grandTotal).then((response) => {
          res.json(response);
        });
      }
    });
});

router.post("/verifyPayment", (req, res) => {
  userHelpers
    .verifyPayment(req.body)
    .then(() => {
      userHelpers
        .changePayementStatus(req.body["order[receipt]"])
        .then((response) => {
          res.json({ status: true });
        });
    })
    .catch((err) => {
      res.json({ status: false });
    });
});

router.get("/viewOrderDetails", async (req, res) => {
  let user = req.session.user;
  let cartcount = await userHelpers.getCartCount(req.session.user._id);
  let  wishlistCount=await userHelpers.getWishlistcount(req.session.user._id);
  userHelpers.getorderProducts(req.session.orderId).then((response) => {
    const orderProducts = response;
    // console.log(orderProducts,"gggggggggggggggggggggggg")
    const ordered_on=moment(orderProducts.ordered_on).format('MMMM Do YYYY, h:mm:ss a');  
      console.log(ordered_on,'Ramya');
    res.render("user/orderSuccess", { ordered_on,user, orderProducts, cartcount,wishlistCount});
  });
});

router.get("/orderPage", async (req, res) => {
  let user = req.session.user;
  console.log(user);
  let cartcount = await userHelpers.getCartCount(req.session.user._id);
  let wishlistCount=await userHelpers.getWishlistcount(req.session.user._id);
    userHelpers.getAllOrderList(req.session.orderId).then((response) => {
    const orderProducts = response;
    console.log(orderProducts+'444444444444444444444444444444444444444444');
    orderProducts.forEach(element=>{
    element.ordered_on=moment(element.ordered_on).format('MMMM Do YYYY, h:mm:ss a'); 
    })
    console.log('444444444444444444444444444444444444444444');
    res.render("user/orderPage", {user,orderProducts,cartcount,wishlistCount});
  });
});

// router.get("/orderPage", (req, res) => {
//   let user=req.session.user._id;
//   userHelpers.getallorders(req.session.user._id).then((response) => {
//     const orders = response; 
//     console.log(orders.deliveryDetails);
//     res.render("user/orderPage", {orders,user});
//   });
// });

router.get("/orderTracking/:id", async (req, res) => {
  const orderId = req.params.id
  let user = req.session.user;
  console.log(user);
  console.log(orderId+'777777777777777777777777777777');
  userHelpers.getorderProducts(orderId).then((response) => {
    const orderProducts = response;
    console.log(orderProducts+'99999999999999999999999999999999999999');
    orderProducts.forEach(element=>{
      element.ordered_on=moment(element.ordered_on).format('MMMM Do YYYY, h:mm:ss a'); 
      })
    res.render("user/orderTracking",{user,orderProducts});
  });
});
router.get('/about',  async function (req, res, next) {
  let user = req.session.user;
  let cartcount = await userHelpers.getCartCount(req.session.user);
  let wishlistCount=await userHelpers.getWishlistcount(req.session.user);
  res.render('user/about',{cartcount,wishlistCount,user});
});
router.get('/contact', async function (req, res, next) {
  let user = req.session.user;
  let cartcount = await userHelpers.getCartCount(req.session.user);
  let wishlistCount=await userHelpers.getWishlistcount(req.session.user);
  res.render('user/contact',{cartcount,wishlistCount,user});
});


// router.get("/add-Towishlist/:id", (req, res, next) => {
//   console.log(req.params.id);
//   userHelpers.addTowishlist(req.params.id, req.session.user._id);
// });

router.get("/add-towishlist/:id",verifyLogin, (req, res) => {
  console.log('000000000000000000000000000000000000000000000')
  userHelpers
    .addTowishlist(req.params.id, req.session.user._id)
    .then((response) => {
      console.log("req.session.user._id");
      res.json({ status: true });
      //   res.redirect("/");
      // });
    })
    .catch((error) => {
      console.log("33333333333333333333333");
      console.log(error.msg);
      res.redirect("/productDetails");
    });
});

router.get("/product", async (req, res) => {
  let user = req.session.user;
  let cartcount = await userHelpers.getCartCount(req.session.user);
  let wishlistCount=await userHelpers.getWishlistcount(req.session.user);
  
  const product=await productHelpers.getProduct();
  res.render("user/products", { product,user,cartcount,wishlistCount });
});
//-----------------------------------------User-Profile-----------------------------------------------------//

router.get('/myprofile',  async (req, res)=> {
  
  const user = await userHelpers.userprofile(req.session.user);
  let cartcount = await userHelpers.getCartCount(req.session.user._id);
  let wishlistCount=await userHelpers.getWishlistcount(req.session.user._id);
  res.render('user/profile/myprofile',{user,cartcount,wishlistCount});
});

//-----------------------------------------Edit-Profile-----------------------------------------------------//

router.get('/edit-profile',  async(req, res, next) =>{
  let user = req.session.user;
  let cartcount = await userHelpers.getCartCount(req.session.user._id);
  let wishlistCount=await userHelpers.getWishlistcount(req.session.user._id);
  res.render('user/profile/edit-profile',{user,cartcount,wishlistCount});
});
//----------------------------------------Address-page------------------------------------------------------//
router.get('/address-page',async (req, res, next)=>{
  let user = req.session.user;
  const Addresses = await userHelpers.getAddresses(req.session.user);
  let cartcount = await userHelpers.getCartCount(req.session.user);
  let wishlistCount=await userHelpers.getWishlistcount(req.session.user);
  res.render('user/profile/address',{Addresses,user,cartcount, wishlistCount});
});

router.post("/addAddress/:id", (req, res) => {
  userHelpers.addAddress(req.params.id, req.body).then((response) => {
    res.redirect("/address-page");
  });
});
//--------------------------------------Add-address-----------------------------------------------------------//

router.get("/addAddress", async(req, res) => {
  let user = req.session.user;
  let cartcount = await userHelpers.getCartCount(req.session.user);
  let wishlistCount=await userHelpers.getWishlistcount(req.session.user);
  res.render("user/profile/addAddress", { user,cartcount,wishlistCount });
});

router.get("/editAddress/:id", async(req, res) => {
  let user = req.session.user;
  let cartcount = await userHelpers.getCartCount(req.session.user);
  let wishlistCount=await userHelpers.getWishlistcount(req.session.user);
  res.render("user/profile/editaddress",{user,cartcount,wishlistCount});
});

router.get("/editAddress/:id", async(req, res) => {
  let user = req.session.user;
  console.log(req.params.id+'addressId');
  const Address = await userHelpers.getOneAddres(req.params.id,user);
  console.log('Addressgggggggggggg:'+Address);
  res.render("user/editAddress",{user});
});

router.get("/deleteAddress/:id", (req, res) => {
  userHelpers.deleteAddress(req.params.id, req.session.user).then((response) => {
    res.redirect("/address-page");
  });
});





router.post("/Editproflie", (req, res) => {

  userHelpers.Editproflie(req.body, req.session.user._id).then(() => {
    res.redirect("/myprofile");
  });
});


router.get("/model",(req, res) => {
 
  res.render("user/model");
});






router.get('/viewOrderProducts/:id',(req,res)=>{
  console.log(req.params.id);
  let user = req.session.user;
  userHelpers.getorderProducts(req.params.id).then((response) => {
    console.log(response.product.status);
    const order=response
    
    if(order.product[0].status=='Cancelled'){
      order.product[0].cancelled=true
    }
    console.log(order);
    res.render('user/orderTracking',{order,user})
  })
  }) 

  router.post('/cancel-order',(req,res)=>{
    userHelpers.cancelorder(req.body).then((response)=>{
      res.json({status:true})
    })
  })
  //--------------------------------wishlist--------------------------------------------------------------//
  router.get("/wishlist", async (req, res) => {
    let user = req.session.user;
    let cartcount = await userHelpers.getCartCount(req.session.user._id);
    let wishlistCount=await userHelpers.getWishlistcount(req.session.user._id);
    const cartItems = await userHelpers.getCartItems(req.session.user);
    let wishlist = await userHelpers.getwishlist(req.session.user);
    if (wishlist) res.render("user/wishlist", { wishlist,user,cartItems,cartcount,wishlistCount });
  });

  router.post("/deletewishlist", async (req, res) => {
    userHelpers.deletewishlist(req.body, req.session.user)
      .then((response) => {
        res.json({ status: true }); 
      });
  });  
  
  // router.post("/searchResults", (req, res) => {
  //   let key = req.body.key;
  //   console.log(key+"dfdgdsgdsgsgsd");
  //  userHelpers.getSearchProducts(key).then((response)=>{
  
  //      console.log(response+"fsadf");
  // const serchProducts=response
  //   res.render("users/pro",{serchProducts})
  //   });
   
  // });
  //search product
// router.post('/search', async (req, res) => {
//   let searchText = req.body['search_name'];
//   console.log(searchText + "ooooooooooooooooooo");
//   try {
//     let products = await userHelpers.getallProductdetails()

//     if (searchText) {
//       let userproducts = products.filter((u) => u.brandnames.brandname.includes(searchText));
//       let category = await adminHelpers.getCategory()
//       console.log(userproducts, "products");
//       res.render('/user/search', { userproducts, category })

//     }

//   } catch (err) {
//     console.log(err);
//   }

// })

// router.get('/filterPage', async (req, res) => {
//   // let cartCount = ''
//   // let wishListCount=''
//   // const user = req.session.user
//   // if (user) {
//   //   cartCount = await userHelper.getCartCount(req.session.user._id)
//   //   wishListCount = await userHelper.getWishListCount(req.session.user._id)
//   // }
//   let category = await adminHelper.getAllCategory()
//   let brands = await adminHelper.getAllBrands()
//   res.render('user/Shop', { cartCount, user, category, brands, filterResult })
// })
// router.get('/filterbrands/:id', (req, res) => {
//   const brandFilter = req.params.id
//   userHelper.filterBrands(brandFilter).then((result) => {
//     filterResult = result
//     res.redirect("/filterPage")
//   })
// })
router.post("/searchResult", (req, res) => {
  let key = req.body.key;
  console.log(key+"dfdgdsgdsgsgsd");
 userHelpers.getSearchProducts(key).then((response)=>{
  serchProducts=response
  console.log("aaaaaaaaaaaaaaaaaaaa");
  console.log(serchProducts);
  res.redirect("/searchResults")
  });
 
});
router.get('/searchResults',(req,res)=>{

  res.render("user/search",{serchProducts})
})







// // router.get('/search', function (req, res, next) {
  
//   res.render("user/search");
// });

module.exports = router;
