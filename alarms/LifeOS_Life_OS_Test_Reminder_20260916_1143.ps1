
$ErrorActionPreference = 'SilentlyContinue'
try {
    [Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] | Out-Null
    [Windows.Data.Xml.Dom.XmlDocument, Windows.Data.Xml.Dom.XmlDocument, ContentType = WindowsRuntime] | Out-Null
    $tmpl = [Windows.UI.Notifications.ToastNotificationManager]::GetTemplateContent([Windows.UI.Notifications.ToastTemplateType]::ToastText02)
    $xml  = [xml] $tmpl.GetXml()
    $xml.toast.visual.binding.text[0].InnerText = '⏰  Life OS Test Reminder'
    $xml.toast.visual.binding.text[1].InnerText = 'This is your Life OS reminder system working!'
    $doc  = New-Object Windows.Data.Xml.Dom.XmlDocument
    $doc.LoadXml($xml.OuterXml)
    $toast = [Windows.UI.Notifications.ToastNotification]::new($doc)
    [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier('Life OS').Show($toast)
    Start-Sleep -Seconds 15
} catch {
    Add-Type -AssemblyName System.Windows.Forms
    [System.Windows.Forms.MessageBox]::Show('This is your Life OS reminder system working!', '⏰  Life OS: Life OS Test Reminder', 0, 48)
}
