import React, { useRef, useState } from 'react';
import './Slidable.scss';

const Slidable = ({ translateX, children }) => {
  const slideRef = useRef(null);
  const [slide, setSlide] = useState(false);

  const onClickHandler = () => {
    if (!slide) {
      slideRef.current.style.transform = `translateX(${translateX})`;
      setSlide(true);
    } else  {
      slideRef.current.style.transform = `translateX(1px)`;
      setSlide(false);
    }
  }

  return (
    <div className="slidable" onClick={onClickHandler} ref={slideRef}>
      {children}
    </div>
   );
}

export default Slidable;
