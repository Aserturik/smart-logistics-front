import { Link } from "react-router-dom";
import "./Card.css";
import Button from "../button/Button";

function Card(props) {
  let title = props.title || "Card title";
  let description =
    props.description ||
    "Some quick example text to build on the card title and make up the bulk of the card";
  // Ruta a la que se navegará al hacer clic en el botón
  let linkTo = props.linkTo || `/warehouse/${props.id}`;

  return (
    <div className="card">
      <div className="card-header">Store {props.id}</div>
      <div className="card-body">
        <h5 className="card-title">{title}</h5>
        <p className="card-text">{description}</p>
        <Link to={linkTo}>
          <Button className="button" children={" Location"} />
        </Link>
        <Link to={`/editStore/${props.id}`}>
          <Button className="button" children={"Inspect"} />
        </Link>
      </div>
      <div className="card-footer">2 days ago</div>
    </div>
  );
}

export default Card;
