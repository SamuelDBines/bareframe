-- Public share links (unguessable token stored for prototype.share_url)
ALTER TABLE product_packages ADD COLUMN IF NOT EXISTS share_token TEXT UNIQUE;
