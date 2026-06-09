.PHONY: run serve open help

# Default port
PORT ?= 3000

# Directory to serve
DIR ?= .

help: ## Show this help
	@echo ""
	@echo "  \033[1;36m📖 از PHP تا Go — Makefile\033[0m"
	@echo ""
	@echo "  \033[1mUsage:\033[0m"
	@echo "    make          Start the book on http://localhost:$(PORT)"
	@echo "    make run      Same as above"
	@echo "    make serve    Start server without opening browser"
	@echo "    make open     Open the book in browser"
	@echo ""
	@echo "  \033[1mOptions:\033[0m"
	@echo "    PORT=8080     Use a different port (default: 3000)"
	@echo ""

run: ## Start server and open the book in browser
	@echo ""
	@echo "  \033[1;32m📖 کتاب «از PHP تا Go» روی http://localhost:$(PORT) اجرا شد\033[0m"
	@echo "  \033[90mPress Ctrl+C to stop\033[0m"
	@echo ""
	npx http-server "$(DIR)" -p $(PORT) -c-1 --cors -o /00.00-front-matter.html

serve: ## Start server without opening browser
	@echo ""
	@echo "  \033[1;32m📖 کتاب «از PHP تا Go» روی http://localhost:$(PORT) اجرا شد\033[0m"
	@echo "  \033[90mPress Ctrl+C to stop\033[0m"
	@echo ""
	npx http-server "$(DIR)" -p $(PORT) -c-1 --cors

open: ## Open the book in default browser
	@open http://localhost:$(PORT)/00.00-front-matter.html 2>/dev/null || xdg-open http://localhost:$(PORT)/00.00-front-matter.html 2>/dev/null || python3 -m webbrowser http://localhost:$(PORT)/00.00-front-matter.html 2>/dev/null || true
