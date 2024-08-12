import { CircularGauge } from "devextreme-react";
import { useScreenSize } from "./media-query";
import {
  Geometry,
  Label,
  Range,
  RangeContainer,
  Scale,
  Size,
  Tick,
  ValueIndicator,
} from "devextreme-react/circular-gauge";
import { alert, custom } from "devextreme/ui/dialog";

export const camelCase = (str) => {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
      return index === 0 ? word.toUpperCase() : word.toLowerCase();
    })
    .replace(/\s+/g, "");
};

export function onKeyDown_Withpoint(e){
  if (e.event.key === "-" || e.event.key === "_") {
    e.event.preventDefault();
    e.event.stopImmediatePropagation();
  }
}

export function onKeyDown_Withpoint_withoutPlus(e){
  if (e.event.key === "-" || e.event.key === "_" || e.event.key === "+") {
    e.event.preventDefault();
    e.event.stopImmediatePropagation();
  }
}

export function onKeyDown_Withpoint_withoutPlus_withoutSpecialCharacters(e){
  if (e.event.key === "-" || e.event.key === "_" || e.event.key === "+" || e.event.key === "#"  || e.event.key === "$" || e.event.key === "%"  || e.event.key === "'" || e.event.key === "," || e.event.key === "₹") {
    e.event.preventDefault();
    e.event.stopImmediatePropagation();
  }
}

export function onKeyDown(e) {
  if (e.event.key === "-" || e.event.key === "." || e.event.key === "_") {
    e.event.preventDefault();
    e.event.stopImmediatePropagation();
  }
}


export const HideDatagridLoader = {
  enabled: false,
};

export const StarRating = ({ rating, largeStar }) => {
  const { isXSmall, isSmall } = useScreenSize();

  const stars = Array.from({ length: 5 }, (_, index) => index < rating);
  return (
    <div
      className={
        largeStar && !isXSmall && !isSmall ? "large-star" : "star-rating"
      }
    >
      {stars.map((filled, index) => (
        <span
          key={index}
          role="img"
          aria-label={filled ? "star-filled" : "star-empty"}
          className={filled ? "star-filled" : "star-empty"}
        >
          {filled ? "★" : "☆"}
        </span>
      ))}
    </div>
  );
};

export default StarRating;

export const CircularGaugeFunc = (props) => {
  return (
    <>
    <div className="position-relative ">

    <div className={props.smallGauge ? "gauge-percent-value-sm":"gauge-percent-value"}>{props.percentValue}%</div>
      <CircularGauge id="ChangeOrders">
        <Size width={props.smallGauge ? 50 : 80} height={props.smallGauge ? 50 : 80} />
        <ValueIndicator
          type="twoColorNeedle"
          secondFraction={0.0}
          color="none"
          secondColor={"green"}
        ></ValueIndicator>
        <Scale>
          <Tick visible={false}></Tick>
          <Label visible={false}></Label>
        </Scale>
        <RangeContainer
          width={props.smallGauge ? 4 : 7}
          backgroundColor="#e0e0e0"
          orientation={"inside"}
        >
          <Range
            startValue={0}
            endValue={props.endValue}
            color={props.color}
          ></Range>
        </RangeContainer>
        <Geometry startAngle={90} endAngle={450}></Geometry>
      </CircularGauge>
      </div>
    </>
  );
};


export function ShowAlert(message, title) {
  return (
    alert(`<div class="row align-items-center"><i class="dx-icon-warning alert-icon col-auto pe-0"> </i><span class="alertText col">${message}</span></div>`, title)
  )
}

export const eCRUDStatus = {
  None: 0,
  Inserted: 1,
  Updated: 2,
  Deleted: 3
};

export function GetFormattedDate(inputString) {

  const dateObject = new Date(inputString);

  // Get the individual components of the date
  const day = dateObject.getDate().toString().padStart(2, '0');
  const month = (dateObject.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based
  const year = dateObject.getFullYear().toString(); // Get year

  // Create the formatted date string
  const formattedDate = `${day}/${month}/${year}`;
  return formattedDate
}

export function GetFormattedTime(inputString) {
  const dateObject = new Date(inputString);

  // Get the individual components of the time
  const hours = dateObject.getHours();
  const minutes = dateObject.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  
  // Convert hours to 12-hour format
  const formattedHours = hours % 12 || 12;
  
  // Create the formatted time string
  const formattedTime = `${formattedHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  return formattedTime
}


export function ConflictPopup(conflicMessage) {
  
  if (conflicMessage === "Record already modified by another user.") {
    let myDialog = custom({
        title: "Vakency",
        messageHtml: "This record has been modified by another user. <br/> Reload to see the latest version of the record. Data entered on this screen will be lost.",
        buttons: [{
            text: "Reload",
            type: "success",
            stylingMode: "contained",
            elementAttr: { class: "btnReload" },
            onClick: (e) => {
                return true;
            }
        },
        {
            text: "Cancel",
            type: "danger",
            stylingMode: "contained",
            elementAttr: { class: "btnCancel" },
            onClick: (e) => {
                return false;
            }
        },
        ]
    });

    return myDialog.show().then((dialogResult) => {
        if (dialogResult) {
            return true;
        }
        else {
            return false;
        }

    });
}else {
  return;
}
}

export const PasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const onDragOver =(e)=>{
  e.preventDefault();
}

export const minDate = new Date(1901, 0, 1);

