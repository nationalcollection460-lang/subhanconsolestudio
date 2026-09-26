import { Link } from 'react-router-dom';
import { ArrowLeft, Compass, Home } from 'lucide-react';

import { Logo } from '../components/ui';

export default function NotFound() {
  return (
    <section className="section">
      <div className="container-x flex flex-col items-center gap-6 py-16 text-center">
        <Logo size={56} />
        <h1 className="font-display text-4xl font-extrabold text-white">Page not found</h1>
        <p className="max-w-lg text-sm text-slate-400">
          Ye page mojood nahi hai. Home page par wapas jayein ya humein WhatsApp par message karein — hum aap ki madad karenge.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link to="/" className="btn-primary">
            <Home className="h-4 w-4" />
            Go to home
          </Link>
          <Link to="/courses" className="btn-outline">
            <Compass className="h-4 w-4" />
            Browse courses
          </Link>
          <Link to="/contact" className="btn-ghost">
            <ArrowLeft className="h-4 w-4" />
            Contact the studio
          </Link>
        </div>
      </div>
    </section>
  );
}
