import React, { useState , useEffect } from 'react';
import {connect} from 'react-redux';
import Header from '../../components/header/Header';
import Footer from '../../components/footer/Footer'; 
import ProductItem from '../../components/product-item/ProductItem'; 
import EditProductModal from '../../components/edit-modal/EditModal'; 
import {loading , storeWooProducts , deleteWooProudct , editWooProduct} from '../../store/actions/';
import API from '../../API/'; 
import Pagination from 'rc-pagination';

const DEFAULT_PER_PAGE          = 18;

const Products = ({dispatch , USER , WOO_PRODUCTS  }) => {

    const [pagesTotal,setPagesTotal]    = useState(0);
    const [pager,setPager]              = useState(1);
    const [perPage,setPerPage]          = useState(DEFAULT_PER_PAGE);

    useEffect(() => {
        if(WOO_PRODUCTS.length <= 0){ 
            dispatch(loading(true, "header-loader"));
            getWooProducts();
        }
    }, []); 
    
    useEffect(() => {
        if(WOO_PRODUCTS.length > 0){
            getWooProducts(pager);
        }
    }, [pager]);

    const getWooProducts = (page) => {
        dispatch(loading(true, "header-loader"));
        API.WC_getWooProducts( USER.token , perPage ,pager )
        .then((result)=>{
            if( result !== undefined ){
                dispatch(storeWooProducts(result.data));
                setPagesTotal(result.headers['x-wp-totalpages'])
                // HIDE LOADER
                dispatch(loading(false, "header-loader"));
            }
        })
        .catch((error)=>{
            dispatch({
                type : 'ERROR',
                payload : error
            })
            // HIDE LOADING
            dispatch(loading(false, "header-loader"));
        })
    }

    const renderProducts = () => {
        return WOO_PRODUCTS.map((product, i)=> (<ProductItem key={i} data={product} deleteFunc={(id)=>deleteProduct(id)} openModalEdit={(data)=>dispatch(editWooProduct(true,data))}/>) );
    }
    
    const renderProductsContainer = () => {
        return(
            <ul id="products-list" className={WOO_PRODUCTS.length < 3 ? 'few-products' : ''}>
                { renderProducts() }
            </ul>
        )
    }

    const pageChangeHandler = (pg) => {
        setPager(pg);
    }

    const deleteProduct = (productId) => {
        dispatch(loading(true, "header-loading"));
        API.WC_deleteProduct(USER.token, productId).then((data)=>{ 
            console.log(data);
            dispatch(deleteWooProudct(data.id));
            dispatch(loading(false, "header-loading"));
        })
        .catch((error)=>{
            dispatch({
                type : "ERROR",
                payload : error
            });

            // HIDE LOADING
            dispatch(loading(false, "header-loading"));

        })
        // handleClose()
    }

    return(
        <div id="user-products-page" > 
            <Header />
            <div id="container">
                { WOO_PRODUCTS.length > 0 ? renderProductsContainer() : null}

                { pagesTotal > 0 ? 
                <Pagination 
                    pageSize={DEFAULT_PER_PAGE}
                    onChange={pageChangeHandler} 
                    current={pager} 
                    total={DEFAULT_PER_PAGE *  pagesTotal}
                    showLessItems
                    locale={{
                        prev_page   : "PREV_PAGE",
                        next_page   : "NEXT_PAGE",
                        prev_5      : "PREV_5_PAGES",
                        next_5      : "NEXT_5_PAGES",
                        prev_3      : "PREV_3_PAGES",
                        next_3      : "NEXT_3_PAGES"
                    }}
                />
                : null}
            </div>
            <EditProductModal />
            <Footer />
        </div>
    );
}

const mapStateToProps = ({ USER , WOO_PRODUCTS }) => ({ USER , WOO_PRODUCTS});

export default connect(mapStateToProps)(Products);