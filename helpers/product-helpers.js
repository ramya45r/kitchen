const productData = require("../models/productData");
const brands = require("../models/brand");
const categories = require("../models/category");
const subcategories = require("../models/subCategory");
//const productDatas = require("../models/productData");
const orderModel = require('../models/order')
const bcrypt=require("bcrypt");
const userData = require("../models/user");
const adminData =require("../models/adminData")
const couponmodel=require("../models/Coupon");
const Carouselmodel=require("../models/Carousel")
const moment=require('moment')
module.exports = {
  // doadminlogin: (adminDataa) => {
  //   console.log(adminDataa);
  //   return new Promise(async (resolve, reject) => {
  //     let response = {};
  //     const admin = await adminDataModel.findOne({ email: adminDataa.email });

  //     if (admin) {
  //       console.log("admin Email true");
  //       bcrypt.compare(adminDataa.password, admin.password).then((result) => {
  //         if (result) {
  //           console.log("admin login true");
  //           response.admin = admin;
  //           response.status = true;
  //           resolve(response);
  //         } else {
  //           console.log("login error");
  //           reject({
  //             status: false,
  //             msg: "Your username or password is incorrect",
  //           });
  //         }
  //       });
  //     } else {
  //       console.log("Login Failed");
  //       reject({
  //         status: false,
  //         msg: "Your username or password is incorrect",
  //       });
  //     }
  //   });
  // },
  doLogin: (adminData1) => {
    console.log(adminData1);
    return new Promise(async (resolve, reject) => {
      let loginStatus = false;
      let response = {};
      let admin = await adminData.findOne({ email: adminData1.email });
      // let admin= await adminData.findOne({email:userDataaa.email})
      // console.log(userData);
       //console.log(user.email);

      if (admin) {
        
        console.log(admin);
        
        console.log(adminData1.password,'11111111111111111');
        console.log(admin.password);
        bcrypt.compare(adminData1.password, admin.password).then((status) => {
          if (status) {
            console.log("Login Success!");
            response.admin =admin;
            response.status = true;
            resolve(response);
            console.log(response + "1234");
          } else {
            console.log("Login Failed");
            reject({ status: false, msg: "Password not matching!" });
          }
        })
      } else {
        console.log("Login Failed");
        reject({ status: false, msg: "Email not registered, please sign up!" });
      }
    });
  },





    //-------------------------Add-category---------------------------------------------------------//
    addCategory: (categoryData) => {
        return new Promise(async (resolve, reject) => {
          const categoryName = categoryData.Category;
          console.log(categoryName);
    
          const categoryexist = await categories.findOne({
            Category: categoryName,
          });
          if (categoryexist) {
            reject({ status: false, msg: "Entered Category already exists!" });
          } else {
            const addCategories = await new categories({
              Category: categoryName,
            });
            await addCategories.save(async (err, result) => {
              if (err) {
                reject({ msg: "Category can't be added" });
              } else {
                resolve({ result, msg: "New Category Added" });
              }
            });
          }
        });
      },
      //------------------getCategories----------------------------------------------------------------------//
      getCategories: () => {
        return new Promise(async (resolve, reject) => {
          const allCategory = await categories.find({}).lean();
          resolve(allCategory);
        });
      },
      //------------------------------Add-Subcategories------------------------------------------------------//
      addSubcategory: (subcategoryData) => {
        return new Promise(async (resolve, reject) => {
          const subcategoryName = subcategoryData.Sub_category;
          console.log(subcategoryData);
    
          const subcategoryFind = await subcategories.findOne({
            Sub_category: subcategoryName,
          });
          const categoryFind = await categories.findOne({
            Category: subcategoryData.Category,
          });
          if (subcategoryFind) {
            reject({ status: false, msg: "Entered Subcategory already exist" });
          } else {
            const addSubcategories = await new subcategories({
              Sub_category: subcategoryName,
              Category: categoryFind._id,
            });
    
            await addSubcategories.save(async (err, result) => {
              if (err) {
                reject({ msg: "Subcategory can't be added" });
              } else {
                resolve({ result, msg: "New Subcategory Added" });
              }
            });
          }
        });
      },
      //-------------------------------get-subcategories--------------------------------------------------------//
      getSubcategories: () => {
        return new Promise(async (resolve, reject) => {
          const allSubcategory = await subcategories.find({}).lean();
          resolve(allSubcategory);
        });
      },
      //--------------------------------Add-Brands----------------------------------------------------------------//
      addBrandName: (brandData) => {
        return new Promise(async (resolve, reject) => {
          const brandNames = brandData.Brand_Name;
          //console.log(brandNames);
    
          const brandexist = await brands.findOne({ Brand_Name: brandNames });
          if (brandexist) {
            reject({ status: false, msg: "This Brand already exists!" });
          } else {
            const addBrand = await new brands({
              Brand_Name: brandNames,
            });
            await addBrand.save(async (err, result) => {
              if (err) {
                reject({ msg: "Brand can't be added" });
              } else {
                resolve({ result, msg: "New Brand added" });
              }
            });
          }
        });
      },
      getBrands: () => {
        return new Promise(async (resolve, reject) => {
          const brandsData = await brands.find({}).lean();
          resolve(brandsData);
        });
      },
    
    //-----------------------------------------------Add-product--------------------------------------------//
    addProduct: (data, image1, image2, image3, image4) => {
      return new Promise(async (resolve, reject) => {
        const subcategoryData = await subcategories.findOne({
          Sub_category: data.Subcategory,
        });
        const brandData = await brands.findOne({ Brand_Name: data.brand });
        const categoryData = await categories.findOne({
          Category: data.Category,
        });
  
        console.log("Subcategory: " + subcategoryData);
        console.log("Brand: " + brandData);
        console.log("Category: " + categoryData);
  
        if (!image2) {
          reject({ msg: "Upload Image" });
        } else {
          const newProduct = await productData({
            Product_Name: data.Product_Name,
            Description: data.Description,
            MRP: data.MRP,
            Discount: data.Discount,
            Size: data.Size,
            Stock: data.Stock,
            Color: data.Color,
            Category: categoryData._id,
            Sub_category: subcategoryData._id,
            Brand: brandData._id,
            Images: { image1, image2, image3, image4 },
          });
          await newProduct.save(async (err, result) => {
            if (err) {
              reject({ msg: "Product can't be added" });
            } else {
              resolve({ data: result, msg: "Product Added Successfully" });
            }
          });
        }
      });
    },
  
  //------------------------------get-product-----------------------------------------------------------------//
    getProducts: (product) => {
      return new Promise(async (resolve, reject) => {
        const allProducts = await productData.find({pro_Id:product}).populate('Category').populate('Sub_category').populate('Brand').sort({ _id: -1 }).limit(3).lean()
        resolve(allProducts);
      });
    },
    getProduct: (product) => {
      return new Promise(async (resolve, reject) => {
        const allProducts = await productData.find({pro_Id:product}).populate('Category').populate('Sub_category').populate('Brand').sort({ _id: -1 }).limit(4).lean()
        resolve(allProducts);
      });
    },
    getProduct: (product1) => {
      return new Promise(async (resolve, reject) => {
        const allProducts = await productData.find({pro_Id:product1}).populate('Category').populate('Sub_category').populate('Brand').sort({ _id: -1 }).limit(4).lean()
        resolve(allProducts);
      });
    },
  
    getoneProduct: (data) => {
      return new Promise(async (resolve, reject) => {
        const theProduct = await productData.findOne({_id:data}).lean();
        resolve(theProduct);
      });
    },
    

  //------------------------------Edit-products-------------------------------------------------------------------//

  editProducts: (data, proId, image1, image2, image3, image4) => {
    return new Promise(async (resolve, reject) => {
      console.log("jglskdj");
      const subcategoryData = await subcategories.findOne({
        _id: data.Sub_category
      });
      const brandData = await brands.findOne({ _id: data.Brand });
      const categoryData = await categories.findOne({
        _id: data.Category
      });
      console.log(categoryData);
      const updateProduct = await productData.findByIdAndUpdate(
        { _id: proId },
        {
          $set: {
            Product_Name: data.Product_Name,
            Description: data.Description,
            MRP: data.MRP,
            Discount: data.Discount,
            Size: data.Size,
            Stock: data.Stock,
            Color: data.Color,
            Category: categoryData._id,
            Sub_category: subcategoryData._id,
            Brand: brandData._id,
            Images: { image1, image2, image3, image4 },
          },
        }
      ); resolve({updateProduct, msg:"The Product is Edited"})
    });
  },
  deleteProduct: (proId) => {
    console.log("log2: " + proId);
    return new Promise(async (resolve, reject) => {
      let productId = proId;
      const removedProduct = await productData.findByIdAndDelete({
        _id: productId,
      });
      resolve(removedProduct);
    });
  },    
  //------------------------------user-management-----------------------------------------------------------------//
getAllUsers: () => {
  return new Promise(async (resolve, reject) => {
    let users = await userData.find().lean();
    resolve(users);
  });
},

Blockuser: (userId) => {
    console.log(userId);
    return new Promise(async (resolve, reject) => {
      const user = await userData.findByIdAndUpdate(
        { _id: userId },
        { $set: { block: true } },
        { upsert: true }
      );
      resolve(user);
    });
  },

  UnBlockuser: (userId) => {
    return new Promise(async (resolve, reject) => {
      const user = await userData.findByIdAndUpdate(
        { _id: userId },
        { $set: { block: false } },
        { upsert: true }
      );
      resolve(user);
    });
  },
  //---------------------------------------//
  // getAllProducts:()=>{
  //   console.log('in get all products');
  //   return new Promise(async(resolve,reject)=>{
  //     console.log('inside rs');
  //     const allProducts= await productData.find({}).lean();
  //     resolve(allProducts)
  //   })
  // },

//-------------------------------------------product-Details------------------------------------------//
getProductDetails:(proId)=>{
  return new Promise(async(resolve,reject)=>{
    const productDetails = await productData.findOne({_id:proId}).lean().then((productDetails)=>{
      resolve(productDetails)
      console.log(productDetails);
    })
  })
  },
  //----------------------------------------order Management---------------------------------------//
  allorders: () => {
    return new Promise(async (resolve, reject) => {
        const allorders = await orderModel.find({}).populate("product.pro_Id").sort({ _id:1}).lean()
        resolve(allorders)
    })
},


changeOrderStatus:(data)=>{
  return new Promise (async(resolve,reject)=>{
    const state=await orderModel.findOneAndUpdate({_id:data.orderId,'product._id':data.proId},
    {
      $set: {
         "product.$.status":data.orderStatus
        } 
      },

        )
        console.log(state);
resolve()
  })
},
//-----------------------------------------------------------------------------------------------//
AddCoupon:(data)=>{ 
  console.log(data);
  return new Promise(async(resolve,reject)=>{
    const newCoupon=new couponmodel({
      couponName:data.couponName,
      couponCode:data.CoupoCode,
      limit:data.Limit,
      expirationTime:data.ExpireDate,
      discount:data.discount
    })
    await newCoupon.save();
    resolve()
  })
},

//-----------------------------------------------------------------------------------------------------/

getAllCoupons:()=>{
  console.log("kasjfkjk");
  return new Promise (async(resolve,reject)=>{
    const AllCoupons=await couponmodel.find({}).lean()
    resolve(AllCoupons)
  })
},
deletecoupon:(couponId)=>{
  return new Promise(async(resolve,reject)=>{
    console.log(couponId);
    const deletecoupon=await couponmodel.findByIdAndDelete({_id:couponId})
    resolve(deletecoupon)
  })
    },

//---------------------------------Add-carousel---------------------------------------------------------//
addCarousel:(data,image)=>{
  console.log(data);
  return new Promise (async(resolve,reject)=>{
    const addCarousel=new Carouselmodel({
      CarouselHeading:data.CarouselHeading,
      Sub_heading:data.Subheading,
      Image:image
    })
    await addCarousel.save()
    resolve()
  })

},
//--------------------------------------------all-carousel----------------------------------------------------//
allCarousel:()=>{
  return new Promise(async(resolve,reject)=>{
    const allCarousel=await Carouselmodel.find({}).lean()
    resolve(allCarousel)
  })
},
//----------------------------------------------Delete-carousel-----------------------------------------------//

deleteCarousel:(Carouselid)=>{
  return new Promise(async(resolve,reject)=>{
    const deleteCarousel=await Carouselmodel.findOneAndDelete({_id:Carouselid})
    resolve(deleteCarousel)
  })
},



orderdetails:(orderID)=>{
  return new Promise (async(resolve,reject)=>{
    const orderdetails=await orderModel.findOne({_id:orderID}).populate("product.pro_Id").lean()
    resolve(orderdetails)
  })
  },
 

}


