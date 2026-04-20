import { Card, CardHeader, CardContent } from "./ui/card";
import { Navbar } from "./Navbar";

export const AuthWrapper = ({ title, children, showNavbar = false }:{
    title:string,
    children:React.ReactNode,
    showNavbar?: boolean
}) => (
    <div className={`min-h-screen flex justify-center bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_35%),linear-gradient(180deg,#090909_0%,#050505_100%)] px-4 relative ${showNavbar ? "items-start overflow-y-auto pt-28 pb-8" : "items-center overflow-hidden"}`}>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:36px_36px] opacity-40"></div>
      {showNavbar ? (
        <div className="absolute left-0 top-0 z-20 w-full px-4 pt-4">
          <div className="mx-auto w-full max-w-6xl">
            <Navbar />
          </div>
        </div>
      ) : null}

      <Card className="w-full max-w-md bg-surfaceDark shadow-[0_30px_100px_rgba(0,0,0,0.55)] border border-borderColor relative z-10 overflow-hidden rounded-[28px]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.07),transparent_40%)] pointer-events-none"></div>
        <CardHeader className="relative z-10">
          <h2 className="mt-3 text-3xl font-semibold text-center text-white tracking-tight">
            {title}
          </h2>
        </CardHeader>
        <CardContent className="relative z-10">
          {children}
        </CardContent>
      </Card>
    </div>
  );
