import { Link } from "react-router-dom";
import H1 from "./ui/H1";

const Home = () => {
  return (
    <div >
      <H1>Welcome to Fractal?</H1>
      <div className="container mx-auto bg-slate-100 content-center px-32 pt-8">
        <p className="text-center">Where would you like to start?</p>
        <div className="grid grid-cols-2 gap-2 py-8">
          <div className="bg-black">
            <Link to="/daos/new" className="col-span-1 btn"><div className="p-8 text-white text-center">Create a new Fractal</div></Link>
          </div>
          <div className="bg-black">
            <Link to="/daos" className="btn btn-primary"> <div className="p-8 text-white text-center">Find an existing Fractal</div></Link>
          </div>
        </div>
      </div>
    </div>
  );
}


export default Home;