import Header from "@/components/Header";

export default function Contact() {
  return (
    <>
      <Header />
      <main>
        <section className="px-[5%] py-[60px] min-h-[60vh] bg-cloud-dancer">
          <div className="max-w-[900px] mx-auto">
            <h1 className="font-spartan font-semibold text-[36px] md:text-[52px] text-center mb-4">
              Get in Touch
            </h1>

            <p className="text-base md:text-lg leading-relaxed mb-10 text-center">
              We&apos;d love to hear from you! Reach out through any of these channels:
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-6">
              {/* Email Card */}
              <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow md:col-span-3">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="fill-pink-accent"
                  >
                    <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                  </svg>
                  <h3 className="font-spartan font-semibold text-xl">Email</h3>
                </div>
                <a
                  href="mailto:hello@wcscapetown.co.za"
                  className="text-lg text-pink-accent hover:text-yellow-accent transition-colors block text-center mb-2"
                >
                  hello@wcscapetown.co.za
                </a>
                <p className="text-sm text-text-dark/70 text-center">
                  For general enquiries (if in doubt, email this one!)
                </p>
              </div>

              {/* Social Media Card */}
              <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow md:col-span-3">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="fill-pink-accent">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  <h3 className="font-spartan font-semibold text-xl">Social Media</h3>
                </div>
                <p className="text-sm text-text-dark/70 text-center mb-4">
                  Connect with us and stay updated
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <a
                    href="https://www.instagram.com/wcscapetown"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 bg-pink-accent/10 hover:bg-pink-accent hover:text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="fill-current">
                      <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z" />
                    </svg>
                    Instagram
                  </a>
                  <a
                    href="https://www.facebook.com/wcscapetown"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 bg-pink-accent/10 hover:bg-pink-accent hover:text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="fill-current">
                      <path d="M12 2.04C6.5 2.04 2 6.53 2 12.06C2 17.06 5.66 21.21 10.44 21.96V14.96H7.9V12.06H10.44V9.85C10.44 7.34 11.93 5.96 14.22 5.96C15.31 5.96 16.45 6.15 16.45 6.15V8.62H15.19C13.95 8.62 13.56 9.39 13.56 10.18V12.06H16.34L15.89 14.96H13.56V21.96A10 10 0 0 0 22 12.06C22 6.53 17.5 2.04 12 2.04Z" />
                    </svg>
                    Facebook
                  </a>
                </div>
              </div>

              {/* WhatsApp Card */}
              <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow md:col-span-3">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="fill-pink-accent">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                  <h3 className="font-spartan font-semibold text-xl">WhatsApp Community</h3>
                </div>
                <p className="text-sm text-text-dark/70 text-center mb-4">
                  Our most real-time place for updates! We have groups for local discussions, video sharing, social events, and level-specific class info.
                </p>
                <div className="text-center">
                  <a
                    href="https://chat.whatsapp.com/Ftw9AbULyC05liNKPjdrHa"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-pink-accent text-white hover:bg-pink-accent/90 px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    Join DANCE West Coast Swing
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
