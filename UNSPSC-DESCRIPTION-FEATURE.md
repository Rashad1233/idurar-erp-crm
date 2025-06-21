# UNSPSC Code with Description Feature

## 🎯 **Feature Overview**

The UNSPSC code now includes a **description field** that shows what the classification code represents, making it easier for users to understand the item classification.

## 📋 **How It Works**

### **1. AI Generation**
- AI generates both `unspscCode` and `unspscTitle` (description)
- Example: 
  - Code: `43212105`
  - Description: `Printers and plotters and facsimile machines`

### **2. Display in AI Suggestions**
The UNSPSC suggestion now shows:
```
UNSPSC Code
43212105
Printers and plotters and facsimile machines
```

### **3. Form Application**
When UNSPSC is applied:
- ✅ **Code field** gets the numeric code (e.g., `43212105`)
- ✅ **Description field** gets the human-readable description
- ✅ **Description is read-only** and clearly marked as "reference only"

### **4. Database Storage**
- ✅ **Only the code** (`unspscCode`) is saved to the database
- ❌ **Description is NOT saved** - it's for UI reference only
- ✅ **Maintains data integrity** by storing only the official code

## 🎨 **UI Features**

### **AI Suggestions Menu**
```jsx
UNSPSC & Standards Section:
┌─────────────────────────────────────┐
│ 🤖 UNSPSC Code                      │
│ 43212105                           │
│ Printers and plotters and          │
│ facsimile machines                 │
└─────────────────────────────────────┘
```

### **Form Fields**
```jsx
UNSPSC Code: [43212105              ]
UNSPSC Description: [Printers and plotters...] (disabled)
                   ↑ Reference only - not saved to database
```

## 🔧 **Technical Implementation**

### **Frontend Changes**

#### **AI Suggestion Application:**
```javascript
const applyAiSuggestion = (field, value) => {
  form.setFieldValue(field, value);
  
  // Special handling for UNSPSC code
  if (field === 'unspscCode' && aiSuggestions?.unspscTitle) {
    form.setFieldValue('unspscTitle', aiSuggestions.unspscTitle);
  }
};
```

#### **Apply All Function:**
```javascript
form.setFieldsValue({
  // ...other fields...
  unspscCode: aiSuggestions.unspscCode,
  unspscTitle: aiSuggestions.unspscTitle, // Added for display
  // ...
});
```

#### **Form Field Configuration:**
```jsx
<Form.Item 
  label="UNSPSC Description"
  name="unspscTitle"
  help="Description is for reference only - not saved to database"
>
  <Input 
    disabled 
    style={{ backgroundColor: '#f5f5f5' }}
    placeholder="AI will generate UNSPSC description" 
  />
</Form.Item>
```

### **Backend (No Changes Needed)**
- Backend continues to only process `unspscCode`
- `unspscTitle` is not extracted from request body
- Database schema remains unchanged

## 🎯 **User Benefits**

### **Better Understanding**
- Users can see what the UNSPSC code actually represents
- No need to look up codes in external references
- Immediate context for classification decisions

### **Data Integrity**
- Only official UNSPSC codes stored in database
- Descriptions don't create data redundancy
- Future UNSPSC updates won't affect stored descriptions

### **Improved UX**
- Clear visual indication that description is reference-only
- Helps users verify AI suggestions are correct
- Makes form completion more intuitive

## 🚀 **Example Workflow**

1. **User enters**: "laser printer"
2. **AI generates**: 
   - Code: `43212105`
   - Description: `Printers and plotters and facsimile machines`
3. **User sees** both in suggestion menu
4. **User applies** → both fields populated in form
5. **User submits** → only code `43212105` saved to database
6. **Description remains** in form for reference

## ✅ **Result**

Users now have **contextual information** about UNSPSC codes while maintaining **clean database storage** with only the official classification codes.

The feature enhances usability without compromising data integrity! 🎉
