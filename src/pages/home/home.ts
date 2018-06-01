import { Component } from '@angular/core';
import { NavController, IonicPage, Events } from 'ionic-angular';
import { UtilityServiceProvider } from '../../providers/utility-service';
import { DataProductServiceProvider } from '../../providers/dataProduct-service';
import { Product } from '../../models/products';

@IonicPage({
  name: 'home'
})
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  private listPost: Array<Product>;
  public listPostLeft: Array<Product>;
  public listPostRight: Array<Product>;
  public filteredItems: Array<Product>;
  public filterText: string = '';
  public isSearching: boolean = true;
  public lockBtn: boolean = false;
  public selectedPost: any;
  constructor(
    private navCtrl: NavController,
    private utility: UtilityServiceProvider,
    private dataProduct: DataProductServiceProvider,
    private event: Events
  ) {
    this.listPost = new Array<Product>();
    this.filterItems();
  }
  ionViewWillEnter() {
    this.isSearching = true;
    this.dataProduct
      .getListAllProducts()
      .then(res => {
        this.isSearching = false;
        this.listPost = res;
        this.filterItems();
      })
      .catch(err => {
        this.isSearching = false;
        this.utility.showToast(err);
      });
  }

  ionViewDidLoad() {
    this.event.subscribe('homeInteraction', sub => {
      const idx = this.listPost.findIndex(x => x.id === sub.id);
      if (sub.type === 'view') this.listPost[idx].totalView++;
      if (sub.type === 'call') this.listPost[idx].totalChat++;
      if (sub.type === 'comment') this.listPost[idx].totalComment++;
      if (sub.type === 'like')
        if (sub.isLike) {
          this.listPost[idx].totalLike++;
          this.listPost[idx].isLike = true;
        } else {
          this.listPost[idx].totalLike--;
          this.listPost[idx].isLike = false;
        }

      this.filterItems();
    });
  }

  showDetail(data) {
    this.utility.showPopover('detailPost', { id: data.id, page: 'home' }).present();
  }

  createNewPost() {
    this.navCtrl.push('newPost');
  }

  filterItems() {
    if (this.listPost) {
      this.filteredItems = this.listPost.filter(res => {
        for (const key in res) {
          if (res.hasOwnProperty(key)) {
            const element = res[key];
            if (('' + element).toLowerCase().indexOf(this.filterText.trim().toLowerCase()) !== -1) return res;
          }
        }
      });
      this.listPostRight = this.filteredItems.filter((e, i) => i % 2);
      this.listPostLeft = this.filteredItems.filter((e, i) => !(i % 2));
    }
  }

  likeBtnClick(post) {
    this.selectedPost = post;
    post.isLike = !post.isLike;
    this.lockBtn = true;
    this.dataProduct.modifyLikeProduct(post.id, post.isLike).then(
      () => {
        this.lockBtn = false;
        this.selectedPost = null;
        post.totalLike = post.isLike ? post.totalLike + 1 : post.totalLike - 1;
        this.utility.showToast(post.isLike ? 'Product Liked' : 'Product Unliked', 1000);
      },
      err => {
        this.lockBtn = false;
        this.selectedPost = null;
        this.utility.showToast(err);
      }
    );
  }
}
