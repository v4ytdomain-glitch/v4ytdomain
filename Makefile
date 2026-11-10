.PHONY: api web test build

api:
	cd backend && uvicorn app.main:app --reload --port 8000

web:
	npm run dev

test:
	cd backend && python -m pytest tests -q

build:
	npm exec tsc -- --noEmit && npm run build
