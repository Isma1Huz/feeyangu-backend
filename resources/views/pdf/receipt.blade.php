<!DOCTYPE html>
<html>
<head>
    <title>Receipt - {{ $receipt->receipt_number }}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { text-align: center; margin-bottom: 30px; }
        .header h1 { margin: 0; color: #333; }
        .header p { margin: 5px 0; color: #666; }
        .receipt-info { margin: 20px 0; }
        .receipt-info table { width: 100%; }
        .receipt-info td { padding: 8px; }
        .receipt-info td:first-child { font-weight: bold; width: 150px; }
        .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .items-table th, .items-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        .items-table th { background-color: #f2f2f2; }
        .total { text-align: right; font-size: 18px; font-weight: bold; margin-top: 20px; }
        .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>{{ $school->name }}</h1>
        <p>{{ $school->location }}</p>
        <p>OFFICIAL RECEIPT</p>
    </div>

    <div class="receipt-info">
        <table>
            <tr>
                <td>Receipt Number:</td>
                <td>{{ $receipt->receipt_number }}</td>
            </tr>
            <tr>
                <td>Date:</td>
                <td>{{ $issued_date }}</td>
            </tr>
            <tr>
                <td>Student Name:</td>
                <td>{{ $student->first_name }} {{ $student->last_name }}</td>
            </tr>
            <tr>
                <td>Admission Number:</td>
                <td>{{ $student->admission_number }}</td>
            </tr>
            <tr>
                <td>Payment Method:</td>
                <td>{{ strtoupper($receipt->payment_method) }}</td>
            </tr>
            <tr>
                <td>Payment Reference:</td>
                <td>{{ $receipt->payment_reference }}</td>
            </tr>
        </table>
    </div>

    @if($items->count() > 0)
    <table class="items-table">
        <thead>
            <tr>
                <th>Description</th>
                <th style="text-align: right;">Amount (KES)</th>
            </tr>
        </thead>
        <tbody>
            @foreach($items as $item)
            <tr>
                <td>{{ $item->name }}</td>
                <td style="text-align: right;">{{ number_format($item->amount / 100, 2) }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
    @endif

    <div class="total">
        Total Amount Paid: KES {{ $amount_kes }}
    </div>

    <div class="footer">
        <p>This is an official computer-generated receipt. No signature required.</p>
        <p>Thank you for your payment!</p>
    </div>
</body>
</html>
