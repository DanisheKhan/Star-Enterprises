import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Card, Badge, Button, Input } from '@/shared/ui';
import { Smartphone, Tv, ArrowRight, ShieldCheck, MapPin, Phone, MessageSquare, Search } from 'lucide-react';

export function PublicHomePage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  return (
    <div className="space-y-16 py-8 sm:py-12 min-w-0">
      {/* Hero Section */}
      <Container size="xl" className="text-center space-y-4">
        <Badge variant="accent">Welcome to Star Enterprises</Badge>
        <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight text-text max-w-3xl mx-auto">
          Your Trusted Destination for Mobiles, Electronics & Modern Furniture
        </h1>
        <p className="text-base sm:text-lg text-muted max-w-2xl mx-auto">
          Browse certified smartphones, home electronics, and premium furniture across our two specialized stores. Guaranteed genuine products with complete warranty support.
        </p>

        {/* Global Catalog Search Bar */}
        <div className="max-w-xl mx-auto pt-4 flex gap-2">
          <Input
            id="public-search"
            placeholder="Search iPhones, Samsung, Smart TVs, Fridges, Sofas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button variant="solid" onClick={() => navigate('/admin')}>
            <Search size={16} /> Search
          </Button>
        </div>
      </Container>

      {/* Two Store Portals */}
      <Container size="xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 min-w-0">
          {/* Mobiles Section Card */}
          <Card className="p-6 sm:p-8 flex flex-col justify-between space-y-6 hover:border-accent transition-colors">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-3xl border border-border bg-bg flex items-center justify-center text-text shadow-sm">
                <Smartphone size={24} />
              </div>
              <div>
                <Badge variant="default" className="mb-2">
                  Store 01
                </Badge>
                <h2 className="text-2xl font-semibold text-text">Star Mobiles</h2>
                <p className="text-sm text-muted mt-2">
                  Latest 5G smartphones, certified pre-owned iPhones with battery health guarantee, official brand accessories, and transparent trade-in program.
                </p>
              </div>

              <div className="space-y-2 text-xs text-muted pt-2 border-t border-border">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={14} className="text-text" /> 100% Genuine with Store Warranty
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-text" /> Instant WhatsApp Price Enquiry
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border flex items-center justify-between">
              <Button
                variant="solid"
                className="w-full gap-2 justify-center"
                onClick={() => navigate('/admin/mobiles')}
              >
                Browse Mobiles Portal <ArrowRight size={16} />
              </Button>
            </div>
          </Card>

          {/* Furniture & Electronics Card */}
          <Card className="p-6 sm:p-8 flex flex-col justify-between space-y-6 hover:border-accent transition-colors">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-3xl border border-border bg-bg flex items-center justify-center text-text shadow-sm">
                <Tv size={24} />
              </div>
              <div>
                <Badge variant="default" className="mb-2">
                  Store 02
                </Badge>
                <h2 className="text-2xl font-semibold text-text">Star Furniture & Electronics</h2>
                <p className="text-sm text-muted mt-2">
                  Smart 4K Televisions, energy-efficient refrigerators, automatic washing machines, luxury sofas, ergonomic beds, and living room collections.
                </p>
              </div>

              <div className="space-y-2 text-xs text-muted pt-2 border-t border-border">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={14} className="text-text" /> Doorstep Delivery & Professional Installation
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-text" /> Zero Cost EMI Options Available
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border flex items-center justify-between">
              <Button
                variant="solid"
                className="w-full gap-2 justify-center"
                onClick={() => navigate('/admin/furniture-electronics')}
              >
                Browse Furniture & Electronics <ArrowRight size={16} />
              </Button>
            </div>
          </Card>
        </div>
      </Container>

      {/* Trust & Store Contact Section */}
      <Container size="xl">
        <div className="border border-border rounded-3xl p-6 sm:p-8 bg-surface grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-text">
              <MapPin size={18} /> Store Locations
            </div>
            <p className="text-xs text-muted">
              Shop 101 & 102, Main Road Market, Mumbai, Maharashtra 400001
            </p>
            <p className="text-xs text-muted">Open 7 days: 10:00 AM - 9:30 PM</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-text">
              <MessageSquare size={18} /> WhatsApp Enquiry
            </div>
            <p className="text-xs text-muted">
              Have questions about stock availability or buyback price? Message us directly.
            </p>
            <div className="text-xs font-semibold text-text">+91 98200 12345 / +91 98200 12346</div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-text">
              <ShieldCheck size={18} /> Official GST Invoicing
            </div>
            <p className="text-xs text-muted">
              GSTIN: 27AAAAA0000A1Z5. Full B2B and B2C tax compliance with input tax credit support.
            </p>
            <Link to="/admin" className="text-xs font-semibold underline block pt-1">
              Staff & Cashier Admin Login →
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
