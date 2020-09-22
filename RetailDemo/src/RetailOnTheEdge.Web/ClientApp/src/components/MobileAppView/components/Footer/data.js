import HomeIcon from  '../../../../assets/icons/Home.svg';
import WishListIcon from  '../../../../assets/icons/Heart.svg';
import CartIcon from  '../../../../assets/icons/Cart.svg';
import AccountIcon from  '../../../../assets/icons/Settings.svg';

export default [
  {
    label: 'Home',
    icon: HomeIcon,
    clickHandler: 'navigate',
    link: '/'
  },
  {
    label: 'Wish List',
    icon: WishListIcon,
    clickHandler: 'none',
    link: ''
  },
  {
    label: 'Cart',
    icon: CartIcon,
    clickHandler: 'navigate',
    link: '/shopping-cart'
  },
  {
    label: 'Account',
    icon: AccountIcon,
    clickHandler: 'slide',
    link: ''
  },
]
