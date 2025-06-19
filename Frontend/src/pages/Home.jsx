import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Search, Briefcase as BriefcaseBusiness, Trophy, Check, User ,Code,
  Heart,
  DollarSign,
  Book,
  TrendingUp,
  PenTool,
  Wrench,
  Headphones} from 'lucide-react';

  const iconMap = {
  code: Code,
  heart: Heart,
  'dollar-sign': DollarSign,
  book: Book,
  'trending-up': TrendingUp,
  'pen-tool': PenTool,
  wrench: Wrench,
  headphones: Headphones
};

const Home = () => {
  const navigate = useNavigate();
  const [searchData, setSearchData] = useState({
    search: '',
    location: ''
  });

  const jobSectors = [
  { title: 'Technology', count: 1200, icon: 'code' },
  { title: 'Healthcare', count: 850, icon: 'heart' },
  { title: 'Finance', count: 950, icon: 'dollar-sign' },
  { title: 'Education', count: 540, icon: 'book' },
  { title: 'Marketing', count: 800, icon: 'trending-up' },
  { title: 'Design & Creative', count: 650, icon: 'pen-tool' },
  { title: 'Engineering', count: 890, icon: 'wrench' },
  { title: 'Customer Service', count: 680, icon: 'headphones' }
];

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchData.search) params.append('search', searchData.search);
    if (searchData.location) params.append('location', searchData.location);
    navigate(`/jobs?${params.toString()}`);
  };

  const handleSectorClick = (sector) => {
    navigate(`/jobs?search=${encodeURIComponent(sector)}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero section */}
        <section className="bg-gradient-to-r from-navy-800 to-navy-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="animate-fade-in">
                <h1 className="text-4xl md:text-5xl font-bold mb-6">
                  Find Your Perfect Career Match
                </h1>
                <p className="text-xl text-gray-200 mb-8">
                  Connect with top employers and discover opportunities that align with your skills and aspirations across various sectors.
                </p>
                
                <form onSubmit={handleSearch} className="bg-white rounded-xl p-4 shadow-lg">
                  <div className="flex flex-col md:flex-row gap-3">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={searchData.search}
                        onChange={(e) => setSearchData(prev => ({ ...prev, search: e.target.value }))}
                        className="input-field text-gray-400"
                        placeholder="Job title"
                      />
                    </div>
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={searchData.location}
                        onChange={(e) => setSearchData(prev => ({ ...prev, location: e.target.value }))}
                        className="input-field text-gray-400"
                        placeholder="Location"
                      />
                    </div>
                    <button type="submit" className="btn btn-primary whitespace-nowrap">
                      Find Jobs
                    </button>
                  </div>
                </form>
                
                <div className="mt-8 flex flex-wrap gap-6">
                  <Link to="/register" className="btn btn-primary">
                    Create Account
                  </Link>
                  <Link to="/jobs" className="btn btn-outline bg-transparent text-white border-white hover:bg-white/10">
                    Browse Jobs
                  </Link>
                </div>
              </div>
              
              <div className="hidden md:block relative">
                <img
                  src="https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                  alt="People working together"
                  className="rounded-xl shadow-lg object-cover h-full max-h-96 w-full"
                />
                <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-lg p-4 animate-slide-up">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                      <Trophy size={24} />
                    </div>
                    <div>
                      <p className="font-bold text-navy-800">5,000+</p>
                      <p className="text-sm text-gray-600">Jobs Posted</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-navy-800 mb-4">
            Popular Job Sectors
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explore job opportunities across various industries and find the perfect role that matches your skills and interests.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {jobSectors.map((sector, index) => {
            const Icon = iconMap[sector.icon];

            return (
              <div
                key={index}
                className="card hover:border-primary-500 hover:border group cursor-pointer"
                onClick={() => handleSectorClick(sector.title)}
              >
                <div className="p-6 text-center">
                  <div className="h-12 w-12 mx-auto rounded-full bg-primary-100 text-primary-600 flex items-center justify-center mb-4 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                    {Icon && <Icon size={24} />}
                  </div>
                  <h3 className="text-lg font-bold text-navy-800 mb-2">
                    {sector.title}
                  </h3>
                  <p className="text-gray-600 mb-3">
                    {sector.count} open positions
                  </p>
                  <div className="text-primary-600 font-medium inline-flex items-center justify-center group-hover:text-primary-700">
                    Browse Jobs
                    <svg
                      className="ml-1 w-5 h-5 group-hover:translate-x-1 transition-transform"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
        
        {/* How it works section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-navy-800 mb-4">
                How JobMatch Works
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Our platform makes it easy to find and apply for jobs that match your skills and career goals.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: 'Create Your Profile',
                  description: 'Sign up and build your professional profile with your skills, experience, and preferences.',
                  icon: <User size={32} />
                },
                {
                  title: 'Discover Opportunities',
                  description: 'Browse thousands of job listings or receive personalized job recommendations.',
                  icon: <Search size={32} />
                },
                {
                  title: 'Apply and Connect',
                  description: 'Apply to jobs with a single click and connect directly with employers.',
                  icon: <BriefcaseBusiness size={32} />
                }
              ].map((step, index) => (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary-100 text-primary-600 mb-4">
                    {step.icon}
                  </div>
                  <h3 className="text-xl font-bold text-navy-800 mb-3">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Stats section */}
        <section className="py-16 bg-primary-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              {[
                { number: '10,000+', label: 'Job Seekers' },
                { number: '5,000+', label: 'Jobs Posted' },
                { number: '2,500+', label: 'Companies' }
              ].map((stat, index) => (
                <div key={index}>
                  <p className="text-4xl font-bold mb-2">{stat.number}</p>
                  <p className="text-xl">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Featured employers section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-navy-800 mb-4">
                Featured Employers
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Join these top companies who trust JobMatch to find the best talent.
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((company) => (
                <div key={company} className="card p-6 flex items-center justify-center h-24">
                  <div className="text-center text-navy-800 font-bold">
                    Company {company}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* CTA section */}
        <section className="py-16 bg-secondary-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6">Ready to Take the Next Step in Your Career?</h2>
                <ul className="space-y-4 mb-8">
                  {[
                    'Access thousands of job opportunities',
                    'Connect with top employers',
                    'Get notified about jobs that match your skills',
                    'Apply with just a few clicks'
                  ].map((item, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="mr-2 flex-shrink-0 mt-1" size={20} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-4">
                  <Link to="/register" className="btn bg-white text-secondary-600 hover:bg-gray-100">
                    Sign Up Now
                  </Link>
                  <Link to="/jobs" className="btn bg-transparent border border-white text-white hover:bg-white/10">
                    Browse Jobs
                  </Link>
                </div>
              </div>
              
              <div className="hidden md:block">
                <img
                  src="https://images.pexels.com/photos/3760514/pexels-photo-3760514.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                  alt="Professional in an interview"
                  className="rounded-xl shadow-lg"
                />
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Home;