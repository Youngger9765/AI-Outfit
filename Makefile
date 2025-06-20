.PHONY: zip-env

zip-env:
	@if [ ! -f .env.local ]; then \
		echo "❌ .env.local file not found. Please create it first."; \
		exit 1; \
	fi
	@zip --encrypt .env.local.zip .env.local
	@echo "✅ .env.local has been zipped into .env.local.zip with password protection." 