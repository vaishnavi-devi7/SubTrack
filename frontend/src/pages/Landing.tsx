type LandingProps = {
  onGetStarted: () => void;
};

export default function Landing({ onGetStarted }: LandingProps) {
  const handleViewFeatures = () => {
    const el = document.getElementById('features-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background:
          'radial-gradient(circle at top right, rgba(96,165,250,0.25), transparent 30%), linear-gradient(180deg, #eff6ff 0%, #ffffff 100%)',
        padding: '32px',
        fontFamily: 'Inter, Arial, sans-serif',
      }}
    >
      <div style={{ maxWidth: '1180px', margin: '0 auto' }}>
        <nav
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '48px',
            gap: '16px',
            flexWrap: 'wrap',
          }}
        >
          <h1
            style={{
              margin: 0,
              color: '#1e3a8a',
              fontSize: '34px',
              fontWeight: 800,
              letterSpacing: '-0.5px',
            }}
          >
            SubTrack
          </h1>

          <button
            onClick={onGetStarted}
            style={{
              padding: '12px 18px',
              borderRadius: '14px',
              border: 'none',
              background:
                'linear-gradient(135deg, #60a5fa 0%, #2563eb 100%)',
              color: '#fff',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 10px 24px rgba(37,99,235,0.22)',
              transition: 'all 0.25s ease',
            }}
          >
            Get Started
          </button>
        </nav>

        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '36px',
            alignItems: 'center',
            marginBottom: '100px',
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-block',
                padding: '8px 14px',
                borderRadius: '999px',
                backgroundColor: '#dbeafe',
                color: '#1d4ed8',
                fontWeight: 700,
                marginBottom: '18px',
              }}
            >
              Smart subscription tracking
            </div>

            <h2
              style={{
                fontSize: 'clamp(38px, 6vw, 64px)',
                lineHeight: 1.02,
                margin: '0 0 18px 0',
                color: '#1e3a8a',
                letterSpacing: '-1.5px',
                fontWeight: 800,
              }}
            >
              Track every
              <br />
              subscription
              <br />
              in one place
            </h2>

            <p
              style={{
                fontSize: '19px',
                color: '#64748b',
                lineHeight: 1.8,
                marginBottom: '28px',
                maxWidth: '560px',
              }}
            >
              Monitor renewals, control monthly spend, manage trials, and stay
              ahead of upcoming payments with a premium dashboard experience.
            </p>

            <div
              style={{
                display: 'flex',
                gap: '14px',
                flexWrap: 'wrap',
                marginBottom: '28px',
              }}
            >
              <button
                onClick={onGetStarted}
                style={{
                  padding: '14px 22px',
                  borderRadius: '14px',
                  border: 'none',
                  background:
                    'linear-gradient(135deg, #60a5fa 0%, #2563eb 100%)',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '16px',
                  cursor: 'pointer',
                }}
              >
                Start Tracking
              </button>

              <button
                onClick={handleViewFeatures}
                style={{
                  padding: '14px 22px',
                  borderRadius: '14px',
                  border: '1px solid #bfdbfe',
                  backgroundColor: '#ffffff',
                  color: '#1e3a8a',
                  fontWeight: 700,
                  fontSize: '16px',
                  cursor: 'pointer',
                }}
              >
                View Features
              </button>
            </div>

            <div
              style={{
                display: 'flex',
                gap: '28px',
                flexWrap: 'wrap',
              }}
            >
              <div>
                <p style={statLabel}>Active Users</p>
                <p style={statValue}>2.4K+</p>
              </div>

              <div>
                <p style={statLabel}>Tracked Services</p>
                <p style={statValue}>18K+</p>
              </div>

              <div>
                <p style={statLabel}>Renewal Alerts</p>
                <p style={statValue}>99.9%</p>
              </div>
            </div>
          </div>

          <div
            style={{
              background: 'rgba(255,255,255,0.85)',
              borderRadius: '28px',
              padding: '24px',
              boxShadow: '0 20px 50px rgba(37, 99, 235, 0.12)',
              border: '1px solid rgba(224,236,255,0.9)',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
                marginBottom: '20px',
              }}
            >
              <div style={previewCard}>
                <p style={previewLabel}>Monthly Spend</p>
                <h3 style={previewValue}>₹1,867</h3>
              </div>

              <div style={previewCard}>
                <p style={previewLabel}>Upcoming Renewals</p>
                <h3 style={previewValue}>5</h3>
              </div>
            </div>

            <div
              style={{
                backgroundColor: '#f8fbff',
                borderRadius: '20px',
                padding: '18px',
                marginBottom: '18px',
                border: '1px solid #e0ecff',
              }}
            >
              <h4
                style={{
                  marginTop: 0,
                  marginBottom: '14px',
                  color: '#1e3a8a',
                  fontSize: '18px',
                }}
              >
                Dashboard Preview
              </h4>

              <div
                style={{
                  width: '100%',
                  height: '190px',
                  borderRadius: '16px',
                  background:
                    'linear-gradient(180deg, #dbeafe 0%, #f8fbff 100%)',
                  padding: '16px',
                  boxSizing: 'border-box',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', gap: '10px' }}>
                  <div style={miniTopCard}>
                    <span style={miniTopLabel}>Netflix</span>
                    <strong style={miniTopValue}>₹499</strong>
                  </div>
                  <div style={miniTopCard}>
                    <span style={miniTopLabel}>Spotify</span>
                    <strong style={miniTopValue}>₹119</strong>
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    gap: '10px',
                    height: '78px',
                  }}
                >
                  <div style={{ ...barStyle, height: '35px' }} />
                  <div style={{ ...barStyle, height: '58px' }} />
                  <div style={{ ...barStyle, height: '42px' }} />
                  <div style={{ ...barStyle, height: '66px' }} />
                  <div style={{ ...barStyle, height: '50px' }} />
                </div>
              </div>
            </div>

            <div
              style={{
                backgroundColor: '#eff6ff',
                borderRadius: '18px',
                padding: '16px',
              }}
            >
              <p style={{ margin: 0, color: '#1d4ed8', fontWeight: 700 }}>
                Trial Alert
              </p>
              <p style={{ margin: '8px 0 0 0', color: '#475569' }}>
                Figma trial ends in 2 days.
              </p>
            </div>
          </div>
        </section>

        <div style={{ height: '220px' }} />

        <section
          id="features-section"
          style={{
            scrollMarginTop: '20px',
            paddingTop: '20px',
            marginBottom: '40px',
          }}
        >
          <h2
            style={{
              textAlign: 'center',
              color: '#1e3a8a',
              fontSize: '42px',
              marginBottom: '14px',
              fontWeight: 800,
            }}
          >
            Features
          </h2>

          <p
            style={{
              textAlign: 'center',
              color: '#64748b',
              fontSize: '18px',
              marginBottom: '36px',
            }}
          >
            Everything you need to manage subscriptions smarter
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '18px',
            }}
          >
            <div style={featureCard}>
              <h3 style={featureTitle}>Track monthly spend</h3>
              <p style={featureText}>
                View your total recurring costs instantly and stay on budget.
              </p>
            </div>

            <div style={featureCard}>
              <h3 style={featureTitle}>Never miss renewals</h3>
              <p style={featureText}>
                Get a clean overview of upcoming payments and expiring trials.
              </p>
            </div>

            <div style={featureCard}>
              <h3 style={featureTitle}>Manage subscriptions</h3>
              <p style={featureText}>
                Add, edit, and remove services with a smooth full-stack workflow.
              </p>
            </div>

            <div style={featureCard}>
              <h3 style={featureTitle}>Category analytics</h3>
              <p style={featureText}>
                See spending by category like Entertainment, Studies, and AI Tools.
              </p>
            </div>

            <div style={featureCard}>
              <h3 style={featureTitle}>Smart billing logic</h3>
              <p style={featureText}>
                Monthly and yearly plans auto-set renewals, while custom plans stay flexible.
              </p>
            </div>

            <div style={featureCard}>
              <h3 style={featureTitle}>Trial reminders</h3>
              <p style={featureText}>
                Get notified before trials end so you can decide in time.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

const previewCard: React.CSSProperties = {
  backgroundColor: '#f8fbff',
  borderRadius: '18px',
  padding: '18px',
  border: '1px solid #e0ecff',
};

const previewLabel: React.CSSProperties = {
  margin: 0,
  color: '#64748b',
  fontSize: '14px',
};

const previewValue: React.CSSProperties = {
  margin: '10px 0 0 0',
  color: '#1e3a8a',
  fontSize: '32px',
};

const featureCard: React.CSSProperties = {
  backgroundColor: 'rgba(255,255,255,0.82)',
  borderRadius: '22px',
  padding: '24px',
  boxShadow: '0 10px 28px rgba(0,0,0,0.05)',
};

const featureTitle: React.CSSProperties = {
  marginTop: 0,
  marginBottom: '10px',
  color: '#1e3a8a',
};

const featureText: React.CSSProperties = {
  margin: 0,
  color: '#64748b',
  lineHeight: 1.7,
};

const statLabel: React.CSSProperties = {
  margin: 0,
  color: '#64748b',
  fontSize: '14px',
};

const statValue: React.CSSProperties = {
  margin: '6px 0 0 0',
  color: '#1e3a8a',
  fontSize: '26px',
  fontWeight: 700,
};

const miniTopCard: React.CSSProperties = {
  flex: 1,
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  padding: '10px 12px',
  display: 'flex',
  flexDirection: 'column',
  border: '1px solid #dbeafe',
};

const miniTopLabel: React.CSSProperties = {
  color: '#64748b',
  fontSize: '12px',
};

const miniTopValue: React.CSSProperties = {
  color: '#1e3a8a',
  marginTop: '4px',
};

const barStyle: React.CSSProperties = {
  flex: 1,
  borderRadius: '10px 10px 0 0',
  background: 'linear-gradient(180deg, #60a5fa 0%, #bfdbfe 100%)',
};