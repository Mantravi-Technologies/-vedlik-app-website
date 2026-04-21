import VedlikShowcase from './VedlikShowcase'
import LegalPage from './LegalPage'
import AppDownloadRedirect from './AppDownloadRedirect'
import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { getPathname } from './spaNavigation'

type RouteConfig = {
  title: string
  description: string
  content: ReactNode
}

const PRIVACY_CONTENT = (
  <>
    <p><strong>Last Updated:</strong> March 2026</p>

    <h2>1. Introduction</h2>
    <p>
      1.1 Vedlik (hereinafter referred to as &quot;We&quot;, &quot;Our&quot;, &quot;Us&quot;) is the creator and operator of the
      Vedlik - AI &amp; Tech Insights mobile application (&quot;App&quot;). We are committed to the protection of
      user (&quot;You&quot;, &quot;Your&quot;, &quot;User&quot;) information which personally identifies You (&quot;Personal Information&quot;).
    </p>
    <p>
      1.2 By downloading, accessing, or using Vedlik, you provide informed consent to the terms of this
      Privacy Policy. If you do not agree with these terms, do not use the App.
    </p>
    <p>
      1.3 This Policy is intended to support compliance with applicable data protection standards and
      developer guidelines of major app distribution platforms, including Google Play and Apple App Store.
    </p>

    <h2>2. Information Collected</h2>
    <p>
      2.1 <strong>Traffic and Usage Data:</strong> To provide and improve the App, we automatically collect usage
      information, including (i) IP address, (ii) device model and operating system version, and
      (iii) App interactions such as read history, bookmarks, and interface interactions.
    </p>
    <p>
      2.2 <strong>Account Information:</strong> If you create an account, we may collect (i) email address and
      authentication credentials, and (ii) profile and content preferences.
    </p>
    <p>
      2.3 <strong>Third-Party Links:</strong> Vedlik provides outbound links to third-party publishers through an
      in-app browser experience. We do not control those external websites. Once you access a third-party
      site, their own privacy policies and terms apply.
    </p>

    <h2>3. Usage of Personal Information</h2>
    <p>3.1 We use data to:</p>
    <ul>
      <li>Provide and maintain core App functionality (including account-linked features).</li>
      <li>Improve user experience through analytics and product insights.</li>
      <li>Monitor App stability and diagnose crashes or technical failures.</li>
      <li>Communicate account, security, support, or major product updates.</li>
    </ul>
    <p>
      3.2 <strong>Encryption:</strong> Data transmitted between your device and our systems is encrypted in
      transit using HTTPS/TLS.
    </p>

    <h2>4. Disclosure of Personal Information</h2>
    <p>4.1 We do not sell, rent, or trade your Personal Information.</p>
    <p>
      4.2 We may share limited data with trusted service providers (for example, infrastructure or cloud
      hosting providers) strictly to operate the App and subject to confidentiality and data protection obligations.
    </p>
    <p>
      4.3 We may disclose data if required by applicable law, legal process, or to protect rights, property,
      security, and platform integrity.
    </p>

    <h2>5. Data Retention and Deletion</h2>
    <p>
      5.1 You may request deletion of your account and associated Personal Information, including saved content
      and usage-linked data tied to your account.
    </p>
    <p>5.2 <strong>How to delete your data:</strong></p>
    <ul>
      <li><strong>In-App:</strong> Settings &gt; Account &gt; Delete Account.</li>
      <li>
        <strong>Via Email:</strong> Send a request to <a href="mailto:support@vedlik.com">support@vedlik.com</a> with
        the subject line &quot;Vedlik Data Deletion&quot;. We target completion within 14 business days, subject to lawful retention needs.
      </li>
    </ul>

    <h2>6. Security</h2>
    <p>
      We implement physical, managerial, and technical safeguards designed to protect Personal Information.
      No transmission or storage method is completely secure, and absolute security cannot be guaranteed.
    </p>

    <h2>7. Contact and Grievance Officer</h2>
    <p>Entity: The Vedlik Team</p>
    <p>Email: <a href="mailto:support@vedlik.com">support@vedlik.com</a></p>
  </>
)

const TERMS_CONTENT = (
  <>
    <p><strong>Last Updated:</strong> March 2026</p>

    <h2>A. Approval and Acceptance</h2>
    <p>
      These Terms and Conditions of Use (&quot;Terms&quot;) are a legally binding agreement between You and Vedlik
      (&quot;We&quot;, &quot;Our&quot;, &quot;Us&quot;), the operator of the Vedlik - AI &amp; Tech Insights application (&quot;App&quot;).
      By downloading, installing, or using the App, You accept these Terms. If You do not agree, You must not use the App.
    </p>

    <h2>B. Provision of the App and Intellectual Property Compliance</h2>
    <p>
      <strong>Nature of Service:</strong> Vedlik is a productivity and data intelligence experience, not a full-text
      news hosting service.
    </p>
    <p>
      <strong>Transformative Output:</strong> The App provides original short-form summaries based on factual reporting and data points.
      We do not intentionally host or reproduce complete third-party editorial content in the App feed.
    </p>
    <p>
      <strong>Source Attribution:</strong> Vedlik includes source references and outbound links to original publishers
      where available.
    </p>
    <p>
      <strong>App IP:</strong> All native UI, branding, proprietary interaction patterns, and backend systems are our
      intellectual property and protected by law.
    </p>

    <h2>C. User Obligations</h2>
    <ul>
      <li>You will use the App lawfully and for legitimate personal or licensed business use.</li>
      <li>You will not misuse, abuse, attack, scrape, or disrupt App systems or infrastructure.</li>
      <li>You will not reverse-engineer or redistribute protected parts of the App without authorization.</li>
    </ul>

    <h2>D. Restriction of Liability and Disclaimers</h2>
    <p>
      <strong>Data Accuracy:</strong> While we strive for quality and relevance, insights are provided on an
      &quot;as is&quot; basis and may contain omissions or errors.
    </p>
    <p>
      <strong>Third-Party Content:</strong> We are not responsible for content or practices of external websites
      reached through outbound links.
    </p>
    <p>
      <strong>No Warranty:</strong> We do not guarantee uninterrupted, error-free, or continuously available service.
    </p>

    <h2>E. Indemnification</h2>
    <p>
      You agree to indemnify and hold harmless the Vedlik Team and affiliated entities from claims, losses, or
      liabilities arising from your breach of these Terms, misuse of the App, or violation of applicable law.
    </p>

    <h2>F. Governing Law and Dispute Resolution</h2>
    <p>
      These Terms are governed by the laws of India. Courts with appropriate jurisdiction in India shall have
      exclusive jurisdiction over disputes arising from these Terms.
    </p>

    <h2>G. Contact Us</h2>
    <p>Entity: The Vedlik Team</p>
    <p>Email: <a href="mailto:support@vedlik.com">support@vedlik.com</a></p>
  </>
)

const DATA_DELETION_CONTENT = (
  <>
    <p><strong>Last Updated:</strong> March 2026</p>
    <p>
      This page explains how Vedlik users can request account and personal data deletion in line with common
      app platform policy expectations.
    </p>

    <h2>What You Can Request</h2>
    <ul>
      <li>Deletion of your Vedlik account.</li>
      <li>Deletion of personal data associated with that account, including saved bookmarks and account-linked history.</li>
      <li>Closure of active account access linked to your email identity.</li>
    </ul>

    <h2>How To Request Deletion</h2>
    <p><strong>Option 1: In-App</strong></p>
    <p>Open the Vedlik App and go to: Settings &gt; Account &gt; Delete Account.</p>
    <p><strong>Option 2: Email Request</strong></p>
    <p>
      Email <a href="mailto:support@vedlik.com?subject=Vedlik%20Data%20Deletion">support@vedlik.com</a> with:
    </p>
    <ul>
      <li>Subject: <code>Vedlik Data Deletion</code></li>
      <li>Your account email address</li>
      <li>Optional: device details to help us identify the account quickly</li>
    </ul>

    <h2>Processing Timeline</h2>
    <p>
      We target completion of verified deletion requests within <strong>14 business days</strong>. In limited cases,
      we may retain minimum records where required by law, fraud prevention, or legitimate security obligations.
    </p>

    <h2>Identity Verification</h2>
    <p>
      For account safety, we may request reasonable verification to confirm the requester controls the relevant
      account before deletion is processed.
    </p>

    <h2>Need Help?</h2>
    <p>Entity: The Vedlik Team</p>
    <p>Email: <a href="mailto:support@vedlik.com">support@vedlik.com</a></p>
  </>
)

const SUPPORT_CONTENT = (
  <>
    <p><strong>Last Updated:</strong> March 2026</p>
    <p>
      Need help with Vedlik? We are here for you. Find answers to common questions below or reach out directly —
      we aim to respond to all support requests within 2 business days.
    </p>

    <h2>Contact Us</h2>
    <p>
      Email us at <a href="mailto:support@vedlik.com">support@vedlik.com</a> for any of the following:
    </p>
    <ul>
      <li>Bug reports and technical issues</li>
      <li>Feedback and feature requests</li>
      <li>Data deletion or privacy questions</li>
      <li>Waitlist and early access enquiries</li>
      <li>General enquiries about Vedlik</li>
    </ul>

    <h2>Common Issues</h2>

    <h3>App not loading or showing errors</h3>
    <p>
      Try force-closing and reopening the app. If the issue persists, check your internet connection and ensure
      your app is updated to the latest version from the App Store or Google Play.
    </p>

    <h3>Waitlist and early access</h3>
    <p>
      Vedlik is currently available via waitlist. If you joined the waitlist and have not received an invite,
      please email <a href="mailto:support@vedlik.com">support@vedlik.com</a> with the email address you used to sign up.
    </p>

    <h3>Reporting incorrect or missing information</h3>
    <p>
      If you spot a factual error, an incorrect source link, or content that seems out of place, please email
      us with the story title and a brief description of the issue. We review all reports and improve accordingly.
    </p>

    <h2>Response Times</h2>
    <ul>
      <li><strong>General support:</strong> Within 2 business days</li>
      <li><strong>Data deletion requests:</strong> Within 14 business days</li>
      <li><strong>Bug reports:</strong> Acknowledged within 2 business days; fixes depend on severity</li>
    </ul>

    <h2>More Resources</h2>
    <ul>
      <li><a href="/privacy-policy">Privacy Policy</a> — How we handle your data</li>
      <li><a href="/terms-and-conditions">Terms and Conditions</a> — Legal terms for using Vedlik</li>
      <li><a href="/data-deletion-request">Data Deletion Request</a> — Request account and data removal</li>
    </ul>

    <h2>Contact Details</h2>
    <p>Entity: The Vedlik Team</p>
    <p>Email: <a href="mailto:support@vedlik.com">support@vedlik.com</a></p>
  </>
)

const ROUTES: Record<string, RouteConfig> = {
  '/privacy-policy': {
    title: 'Privacy Policy',
    description: 'How Vedlik collects, uses, and protects your personal information.',
    content: PRIVACY_CONTENT,
  },
  '/terms-and-conditions': {
    title: 'Terms and Conditions of Use',
    description: 'The legal terms governing use of Vedlik.',
    content: TERMS_CONTENT,
  },
  '/data-deletion-request': {
    title: 'Data Deletion Request',
    description: 'How to request deletion of your Vedlik account and associated data.',
    content: DATA_DELETION_CONTENT,
  },
  '/support': {
    title: 'Support',
    description: 'Get help with Vedlik — contact us, troubleshoot common issues, and find answers.',
    content: SUPPORT_CONTENT,
  },
}

const SITE_URL = 'https://vedlik.com'
const HOME_TITLE = 'Vedlik — AI, Tech & Startup Intelligence'
const HOME_DESCRIPTION =
  'Stay ahead with artificial intelligence, technology, startups, and funding intelligence in short, trustworthy briefs with source attribution.'

function setMetaTag(selector: string, attr: 'name' | 'property', key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(selector)
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attr, key)
    document.head.appendChild(element)
  }
  element.setAttribute('content', content)
}

function setCanonical(url: string) {
  let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!canonical) {
    canonical = document.createElement('link')
    canonical.setAttribute('rel', 'canonical')
    document.head.appendChild(canonical)
  }
  canonical.setAttribute('href', url)
}

export default function AppRouter() {
  const [pathname, setPathname] = useState(getPathname)
  useEffect(() => {
    const sync = () => setPathname(getPathname())
    window.addEventListener('popstate', sync)
    window.addEventListener('vedlik:route', sync)
    return () => {
      window.removeEventListener('popstate', sync)
      window.removeEventListener('vedlik:route', sync)
    }
  }, [])
  const route = ROUTES[pathname]

  useEffect(() => {
    const isAppPath = pathname === '/app'
    const title = isAppPath
      ? 'Download Vedlik — App Store & Google Play'
      : route
        ? `${route.title} | Vedlik`
        : HOME_TITLE
    const description = isAppPath
      ? 'Download Vedlik for iOS or Android — AI, tech, and startup briefs in one app.'
      : route
        ? route.description
        : HOME_DESCRIPTION
    const url = `${SITE_URL}${pathname === '/' ? '' : pathname}`

    document.title = title
    setCanonical(url)
    setMetaTag('meta[name="description"]', 'name', 'description', description)
    setMetaTag('meta[property="og:title"]', 'property', 'og:title', title)
    setMetaTag('meta[property="og:description"]', 'property', 'og:description', description)
    setMetaTag('meta[property="og:url"]', 'property', 'og:url', url)
    setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', title)
    setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', description)
  }, [pathname, route])

  if (pathname === '/app') {
    return <AppDownloadRedirect />
  }

  if (!route) {
    return <VedlikShowcase />
  }

  return (
    <LegalPage title={route.title} description={route.description}>
      {route.content}
    </LegalPage>
  )
}
