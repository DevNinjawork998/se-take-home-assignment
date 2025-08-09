# McDonald's Order Management System

A Next.js application for managing automated cooking bot orders with priority queuing for VIP customers.

## Features

- ✅ Order management with unique, auto-incrementing order numbers
- ✅ Priority queue system (VIP orders processed before Normal orders)
- ✅ Dynamic bot management (add/remove bots)
- ✅ Real-time order processing simulation (10-second processing time)
- ✅ Order status tracking (PENDING → PROCESSING → COMPLETE)
- ✅ Bot state management (IDLE ↔ PROCESSING)
- ✅ Comprehensive E2E testing with Playwright

## Requirements Compliance

This application fulfills all the requirements from the assignment:

1. ✅ **New Normal Order** - Creates orders in PENDING area
2. ✅ **New VIP Order** - VIP orders queue before Normal orders but behind other VIP orders
3. ✅ **Unique Order Numbers** - Auto-incrementing order numbers
4. ✅ **Bot Processing** - Bots process orders for 10 seconds then move to COMPLETE
5. ✅ **Bot Idle State** - Bots become IDLE when no orders are pending
6. ✅ **Bot Removal** - Removing bots stops processing and returns orders to PENDING
7. ✅ **In-Memory Storage** - No data persistence, all in memory

## Tech Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Playwright** - E2E testing
- **Jest** - Unit testing

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:

   ```bash
   npm install
   ```

3. Install Playwright browsers:
   ```bash
   npx playwright install
   ```

### Running the Application

1. Start the development server:

   ```bash
   npm run dev
   ```

2. Open [http://localhost:3000](http://localhost:3000) in your browser

## Testing

### E2E Tests (Primary Demonstration Method)

The application includes comprehensive E2E tests that verify all requirements:

```bash
# Run E2E tests in headless mode
npm run test:e2e

# Run E2E tests with UI (recommended for demo)
npm run test:e2e:ui

# Run E2E tests in headed mode (see browser)
npm run test:e2e:headed

# Debug E2E tests step by step
npm run test:e2e:debug
```

### Unit Tests

```bash
# Run unit tests
npm run test

# Run unit tests in watch mode
npm run test:watch

# Run all tests (unit + E2E)
npm run test:all
```

## E2E Test Coverage

The E2E tests comprehensively validate all requirements:

| Test Case                                           | Validates                   | Requirements        |
| --------------------------------------------------- | --------------------------- | ------------------- |
| `should display the main interface correctly`       | UI components exist         | Basic functionality |
| `New Normal Order should appear in PENDING area`    | Normal order creation       | Requirement 1       |
| `New VIP Order should appear before Normal orders`  | VIP priority queuing        | Requirement 2       |
| `Order numbers should be unique and increasing`     | Order numbering system      | Requirement 3       |
| `Bot processes orders and becomes IDLE`             | Bot processing & idle state | Requirements 4 & 5  |
| `Multiple VIP orders maintain correct queue order`  | VIP queue ordering          | Requirement 2       |
| `Removing bot stops processing and returns order`   | Bot removal behavior        | Requirement 6       |
| `Complex scenario: Multiple bots and orders`        | Full system integration     | All requirements    |
| `Bot management: Adding and removing multiple bots` | Bot lifecycle               | Requirements 4-6    |
| `Real-time updates: UI updates without refresh`     | Real-time functionality     | User experience     |

## Usage

### Basic Operations

1. **Create Orders**:

   - Click "New Normal Order" to add a normal customer order
   - Click "New VIP Order" to add a VIP customer order

2. **Manage Bots**:

   - Click "+ Bot" to add a new cooking bot
   - Click "- Bot" to remove the newest bot

3. **Monitor Status**:
   - **PENDING ORDERS**: Shows orders waiting to be processed
   - **COMPLETE ORDERS**: Shows finished orders
   - **ACTIVE BOTS**: Shows bot status and current assignments

### Order Processing Flow

```
1. Order Created → PENDING
2. Bot Available → PROCESSING (10 seconds)
3. Processing Complete → COMPLETE
4. Bot becomes IDLE → Ready for next order
```

### VIP Priority System

```
Queue Order: [VIP-001] [VIP-002] [NORMAL-001] [NOR-002]
             ↑ VIP orders processed first
             ↑ Maintains creation order within same type
```

## Project Structure

```
src/
├── app/
│   ├── api/          # REST API endpoints
│   ├── globals.css   # Global styles
│   ├── layout.tsx    # App layout
│   └── page.tsx      # Main dashboard
├── lib/
│   ├── models/       # Core business logic
│   └── store/        # State management
└── types/            # TypeScript definitions

tests/
├── e2e/              # Playwright E2E tests
└── unit/             # Jest unit tests
```

## Development Notes

- **Real-time Updates**: State refreshes every second for live updates
- **Memory-only Storage**: All data is lost on server restart (as required)
- **10-second Processing**: Each order takes exactly 10 seconds to complete
- **Priority Queue**: VIP orders always processed before Normal orders
- **Bot Management**: Dynamic scaling with proper cleanup

## Demonstration

For the interview demonstration, run:

```bash
npm run test:e2e:ui
```

This opens Playwright's test UI where you can:

- Run individual test cases
- Watch tests execute in real-time
- See detailed step-by-step actions
- Verify all requirements are met

The E2E tests serve as the **functioning prototype demonstration** and validate that all assignment requirements are implemented correctly.

## Original Assignment

See [ORIGINAL_ASSIGNMENT.md](./ORIGINAL_ASSIGNMENT.md) for the complete assignment requirements.
