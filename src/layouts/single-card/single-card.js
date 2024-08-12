import React from 'react';
import ScrollView from 'devextreme-react/scroll-view';
import './single-card.scss';


export default function SingleCard({ title, description, children }) {
  return (
    // <ScrollView height={'100%'} width={'100%'} className={'with-footer single-card'}>
    //   <div className={'dx-card content'}>
    //     <div className={'header'}>
    //       <div className={'title'}>{title}</div>
    //       <div className={'description'}>{description}</div>
    //     </div>
    //     {children}
    //   </div>
    // </ScrollView>
    <React.Fragment>
      <div className="single-card d-flex justify-content-center align-items-center m-auto">
        <div className="border p-5 card">
          <div className="row">
            <div className="col-md-6 d-flex align-items-center justify-content-center">
              <img
                src={`${process.env.PUBLIC_URL}/full_logo.svg`}
                alt="Logo"
                className="img-fluid"
              />
            </div>
            <div className="col-md-6">
              <div className="mb-4 title">{title}</div>
              <div className="mb-4 description">{description}</div>
              {children}
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}
