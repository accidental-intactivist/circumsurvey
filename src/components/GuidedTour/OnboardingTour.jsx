import React, { useState, useEffect } from 'react';
import { Joyride, STATUS } from 'react-joyride';
import { useTelemetry } from '../../explore/lib/telemetry';
import { Info } from 'lucide-react';

const CustomBeacon = React.forwardRef((props, ref) => {
  return (
    <button
      ref={ref}
      {...props}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        backgroundColor: 'var(--c-bgDeep, #050506)',
        color: 'var(--c-gold, #d4a030)',
        border: '1px solid var(--c-gold, #d4a030)',
        borderRadius: '100px',
        padding: '6px 14px',
        fontFamily: 'var(--f-condensed, "Barlow Condensed", sans-serif)',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        fontSize: '13px',
        fontWeight: 600,
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(0,0,0,0.5), 0 0 0 rgba(212, 160, 48, 0.4)',
        animation: 'tb-beacon-pulse 2s infinite',
      }}
    >
      <Info size={14} />
      Take Tour
    </button>
  );
});

const CustomTooltip = ({
  continuous,
  index,
  step,
  backProps,
  primaryProps,
  skipProps,
  tooltipProps,
}) => {
  return (
    <div
      {...tooltipProps}
      style={{
        backgroundColor: 'var(--c-bgCard, #18181c)',
        color: 'var(--c-text, #f1f1f1)',
        borderRadius: '4px',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8)',
        border: '1px solid var(--c-ghost, #3f3f46)',
        padding: '24px',
        fontFamily: 'var(--f-body, "Barlow", sans-serif)',
        width: 'calc(100vw - 32px)',
        maxWidth: '340px',
        textAlign: 'left'
      }}
    >
      {step.title && (
        <h3 style={{ margin: '0 0 8px 0', fontFamily: 'var(--f-display, "Playfair Display", serif)', fontSize: '20px', fontWeight: '400', color: 'var(--c-gold, #d4a030)' }}>
          {step.title}
        </h3>
      )}
      <div style={{ margin: 0, fontSize: '15px', color: 'var(--c-textBright, white)', lineHeight: 1.5 }}>
        {step.content}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px' }}>
        <button
          {...skipProps}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--c-dim, #8b8b94)',
            fontFamily: 'var(--f-condensed, "Barlow Condensed", sans-serif)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Skip
        </button>
        <div style={{ display: 'flex', gap: '8px' }}>
          {index > 0 && (
            <button
              {...backProps}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--c-dim, #8b8b94)',
                fontFamily: 'var(--f-condensed, "Barlow Condensed", sans-serif)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Back
            </button>
          )}
          <button
            {...primaryProps}
            style={{
              backgroundColor: 'transparent',
              color: 'var(--c-gold, #d4a030)',
              border: '1px solid var(--c-gold, #d4a030)',
              borderRadius: '4px',
              fontFamily: 'var(--f-condensed, "Barlow Condensed", sans-serif)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              fontSize: '13px',
              fontWeight: 600,
              padding: '6px 14px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#e8b840'; e.currentTarget.style.color = '#050506'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--c-gold, #d4a030)'; }}
          >
            {continuous && index < 2 ? 'Next' : 'Finish'}
          </button>
        </div>
      </div>
      <style>
        {`
          @keyframes tb-beacon-pulse {
            0% { box-shadow: 0 4px 12px rgba(0,0,0,0.5), 0 0 0 0 rgba(212, 160, 48, 0.4); }
            70% { box-shadow: 0 4px 12px rgba(0,0,0,0.5), 0 0 0 10px rgba(212, 160, 48, 0); }
            100% { box-shadow: 0 4px 12px rgba(0,0,0,0.5), 0 0 0 0 rgba(212, 160, 48, 0); }
          }
        `}
      </style>
    </div>
  );
};

export default function OnboardingTour() {
  const { trackEvent, getFeatureFlag } = useTelemetry();
  const [run, setRun] = useState(false);

  useEffect(() => {
    // Determine whether to run the tour based on the A/B test flag.
    const checkFlag = setTimeout(() => {
      const flag = getFeatureFlag('special_report_onboarding', 'test');
      const hasSeenTour = localStorage.getItem('cs_has_seen_tour');
      
      if (flag === 'test' && !hasSeenTour) {
        setRun(true);
        trackEvent('tour_started', { variant: 'test' });
      } else if (flag === 'control' && !hasSeenTour) {
        trackEvent('tour_started', { variant: 'control' });
        localStorage.setItem('cs_has_seen_tour', 'true');
      }
    }, 1500);

    return () => clearTimeout(checkFlag);
  }, [getFeatureFlag, trackEvent]);

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  const steps = [
    {
      target: '#tour-start-target',
      title: 'Welcome to the Report',
      content: 'This is an interactive narrative built on data. Let us show you around so you don\'t miss anything.',
      placement: isMobile ? 'bottom' : 'bottom-start',
      disableBeacon: false, // Use the custom "Take Tour" beacon so it's recognizable!
    },
    {
      target: '#tour-hamburger',
      title: 'Navigation & Settings',
      content: 'Access the Research Assistant, Report Builder, Display Settings, and much more.',
      placement: isMobile ? 'bottom' : 'bottom-end',
    },
    {
      target: '#tour-explore',
      title: 'Interactive Explorer',
      content: 'Jump to the Data Explorer to dive deep into the survey data at any time.',
      placement: isMobile ? 'bottom' : 'bottom-end',
    },
    ...(isMobile ? [] : [{
      target: '#tour-animation-toggle',
      title: 'Animation Toggle',
      content: 'Find the background animations distracting? You can pause them here.',
      placement: 'top-end',
    }]),
    {
      target: '#tour-feedback',
      title: 'We Want to Hear From You',
      content: 'Did anything surprise you? Drop us a line anytime while reading.',
      placement: isMobile ? 'top' : 'top-end',
    }
  ];

  const handleJoyrideCallback = (data) => {
    const { status, type, index } = data;

    if (type === 'step:after') {
      trackEvent('tour_step_viewed', { step_index: index });
    }

    if ([STATUS.FINISHED].includes(status)) {
      trackEvent('tour_completed');
      localStorage.setItem('cs_has_seen_tour', 'true');
      setRun(false);
    } else if ([STATUS.SKIPPED].includes(status)) {
      trackEvent('tour_skipped', { step_index: index });
      localStorage.setItem('cs_has_seen_tour', 'true');
      setRun(false);
    }
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous={true}
      scrollToFirstStep={true}
      showProgress={true}
      showSkipButton={true}
      callback={handleJoyrideCallback}
      tooltipComponent={CustomTooltip}
      beaconComponent={CustomBeacon}
      styles={{
        options: {
          zIndex: 10000,
          arrowColor: '#18181c', // Hardcoded fallback for the arrow just in case Joyride CSS-vars fail
          overlayColor: 'rgba(0, 0, 0, 0.75)',
        }
      }}
    />
  );
}
