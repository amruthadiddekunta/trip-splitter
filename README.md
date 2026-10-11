# Trip Splitter

A React + TypeScript application for tracking shared expenses, splitting costs among members, and viewing balances.

## Getting Started

**Requirements:** Node.js and npm.

```bash
npm install
npm run dev
```

Open the local URL shown in your terminal. The app uses local storage to persist expense data in the browser.

To run the project checks:

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

## Features

- View expenses sorted by newest first.
- Filter expenses by category and view the displayed total.
- Add expenses with a description, amount, payer, date, category, and split method.
- Split expenses equally, by exact amounts, or by percentages.
- View member balances and delete expenses with confirmation.
- Validate form inputs and display errors near the relevant fields.
- Persist data using browser local storage.
- Navigate between the expense list and add-expense pages.

## Three Key Decisions

**1. Redux Toolkit for shared state**

Members and expenses are managed centrally with Redux Toolkit. This keeps expense data consistent across pages and makes updates easier to organize and test.

**2. Store money as integer paise**

Amounts are represented in paise rather than floating-point rupees. This avoids common floating-point precision issues and supports accurate expense splitting, including the distribution of leftover paise in equal splits.

**3. Separate form validation and split calculations**

Validation and money-splitting logic live in utility modules rather than being embedded entirely in UI components. This makes the rules easier to maintain and test independently from the interface.

## What I Would Improve With Another Day

I would expand test coverage for edge cases in percentage and exact splits, verify balance calculations after adding and deleting expenses, and improve accessibility through keyboard navigation and clearer screen-reader feedback. I would also test the layout across different screen sizes and review the persistence approach to keep side effects outside Redux reducers.

## AI Tool Usage

## AI Assistance

AI tools were used to understand the project workflow, assist with code implementation and enhancement, identify and rectify errors, and prepare project documentation. They also helped improve code comments and the README's clarity and structure. AI-generated suggestions were reviewed, and testing and manual checks were used to validate the application before submission.