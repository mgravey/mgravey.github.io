window.disableOnScroll = 1;
// window.minSwipeToSlide = 1;
window.disableOnSwipe = 1;

function loadAllDois(){
  jQuery.getJSON({
    url:'assets/dois.json',
    success: function(data){
      loadDaatFromDois(data);
    }
  })
}

function loadDaatFromDois(doiList){
  var generatedBib='';
  var cpt=0;
  for (var i = doiList.length - 1; i >= 0; i--) {
    $.ajax('https://doi.org/'+doiList[i],
      {headers: {          
        Accept: "application/x-bibtex",         
      },
      success:function(data){
        generatedBib+=data;
        cpt++;
        if(cpt==doiList.length){
          $('#bibtex_input').html(generatedBib);
          createWebPage(defaultTemplate)
        }
      }
    })
  }
}

function jsCustomizeBibTemplate(dom){
  $(dom).find('.Gravey').addClass('bold underline');
}

function jsCustomizeBibDisplay(dom){
  $(dom).find('.sort.title').each(function(groupIdx){
    var val=$(this).find('.templates');
    $(this).html(val);
  })
}

loadAllDois();

$( document ).ready(function() {

  var emailAddressBase64="ciBlIHMgZSBhIHIgYyBoIEAgbSBnIHIgYSB2IGUgeSAuIGMgbyBt";
  var trueEmailAddress=atob(emailAddressBase64).replace(/\s/g,'');
  $(".emailLink").html(trueEmailAddress).attr("href",'mailto:Dr.%20Mathieu%20Gravey%20<'+trueEmailAddress+'>');

  $(function() {
    $(".aProject").sort(sort_proj).appendTo('#projectList');
    function sort_proj(a, b) {
      return ($(b).attr('data-yearStart')) < ($(a).attr('data-yearStart')) ? -1 : 1;
    }
  });
  $('.aProject').addClass('animate__animated').addClass('animate__zoomIn')
  $('input[type=radio][name=projSelect]').change(function() {
    if (this.value == 'all') {
      $('.aProject').removeClass('animate__zoomOut').addClass('animate__zoomIn').slideDown(1000);
    }else{
      $('.aProject').filter(':not(.'+this.value+')').removeClass('animate__zoomIn').addClass('animate__zoomOut').slideUp(1000);
      $('.aProject').filter('.'+this.value).removeClass('animate__zoomOut').addClass('animate__zoomIn').slideDown(1000);
    }
  });

  $(function() {
    $(".aCode").sort(sort_proj).appendTo('#codeList');
    function sort_proj(a, b) {
      return ($(b).attr('data-level')) < ($(a).attr('data-level')) ? 1 : -1;
    }
  });
  $('.aCode').addClass('animate__animated').addClass('animate__zoomIn')
  $('input[type=radio][name=codeSelect]').change(function() {
    if (this.value == 'all') {
        $('.aCode').removeClass('animate__zoomOut').addClass('animate__zoomIn').slideDown(1000);
    }else{
      $('.aCode').filter(':not(.'+this.value+')').removeClass('animate__zoomIn').addClass('animate__zoomOut').slideUp(1000);
      $('.aCode').filter('.'+this.value).removeClass('animate__zoomOut').addClass('animate__zoomIn').slideDown(1000);
    }
  });


  $(function() {
    $(".aSProject").sort(sort_proj).appendTo('#studentProjectList');
    function sort_proj(a, b) {
      return ($(b).attr('data-level')) < ($(a).attr('data-level')) ? 1 : -1;
    }
  });
  $('.aSProject').addClass('animate__animated').addClass('animate__zoomIn')
  $('input[type=radio][name=studentProjSelect]').change(function() {
    if (this.value == 'all') {
        $('.aSProject').removeClass('animate__zoomOut').addClass('animate__zoomIn').slideDown(1000);
    }else{
      $('.aSProject').filter(':not(.'+this.value+')').removeClass('animate__zoomIn').addClass('animate__zoomOut').slideUp(1000);
      $('.aSProject').filter('.'+this.value).removeClass('animate__zoomOut').addClass('animate__zoomIn').slideDown(1000);
    }
  });



});

function setTextResize(){
  $('body').removeClass('fontReduced-2').removeClass('fontReduced-1');
        if ($(window).width()<700) $('body').addClass('fontReduced-2');
  else  if ($(window).width()<1024) $('body').addClass('fontReduced-1');

}

var maxScroll=80;

$(document).ready(function(){
  $(document).on('swiped-left', function(){window.changeSlide("increase")});
  $(document).on('swiped-right' , function(){window.changeSlide("decrease")});

  $(window).on('resize',setTextResize);
  // $(window).on('orientationchange',setTextResize);
  setTextResize();

  $(window).on('wheel',function(ev) {
    // console.log(ev.originalEvent.deltaY);
    // console.log($('section.active .content')[0].scrollTop);
    // console.log($('section.active .content').height());
    // console.log($('section.active .content .container').height());
    maxScroll=Math.min(Math.max(maxScroll,ev.originalEvent.deltaY),400);
    if(($('section.active .content')[0].scrollTop
        +$('section.active .content').height()+10>
         $('section.active .content .container').height())
          && (ev.originalEvent.deltaY>maxScroll/2)){
        window.changeSlide("increase");
    }

    if(($('section.active .content')[0].scrollTop<10)
          && (ev.originalEvent.deltaY<-Math.abs(maxScroll/2))){
        window.changeSlide("decrease");
    }
  });


})

  $(window).on('slideChange',function(){
      setTimeout(function(){
          var page_path=window.location.pathname + window.location.search + window.location.hash;
          gtag('config', GA_MEASUREMENT_ID, {'page_path': page_path});
      },window.effectSpeed);
  });


  

